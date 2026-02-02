import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");
// Plain text model for conversational summary
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Fetch existing summary for today if it exists
    const existingSummary = await prisma.dailySummary.findFirst({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(existingSummary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. Fetch Today's Sales
    const sales = await prisma.sale.findMany({
      where: { date: { gte: start, lte: end } },
      include: { product: true }
    });

    const totalSales = sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const totalCost = sales.reduce((sum: number, s: any) => sum + (s.product.costPrice * s.quantity), 0);
    const estimatedProfit = totalSales - totalCost;

    // 2. Best Seller
    const salesByProduct = sales.reduce((acc: any, curr: any) => {
      acc[curr.product.name] = (acc[curr.product.name] || 0) + curr.quantity;
      return acc;
    }, {});
    const bestSellerEntry = Object.entries(salesByProduct)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    const bestSeller = bestSellerEntry ? bestSellerEntry[0] : "N/A";

    // 3. Stock Alerts
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      take: 3
    });
    const stockAlerts = lowStockProducts.map((p: any) => p.name).join(", ");

    // 4. Generate Summary with Gemini
    const prompt = `
      Create a friendly, WhatsApp-style business summary for an Indian shop owner.
      Use Hinglish (Hindi + English) naturally. Stay positive and helpful.
      
      Stats for Today:
      - Total Sales: ₹${totalSales}
      - Estimated Profit: ₹${estimatedProfit}
      - Top Product: ${bestSeller}
      - Critical Alerts: ${stockAlerts ? `Stock low for: ${stockAlerts}` : "All stock okay"}

      Format it exactly like a WhatsApp message with emojis. 
      Keep it short (4-5 lines).
      Example:
      "Aaj aapki total sale ₹1,250 rahi.
      Munafa approx ₹210 raha.
      Sabse zyada Milk bika.
      ⚠️ Biscuit ka stock kam ho raha hai."
    `;

    const result = await textModel.generateContent(prompt);
    const summaryText = result.response.text().trim();

    // 5. Save to DB
    const savedSummary = await prisma.dailySummary.create({
      data: {
        summaryText,
        date: today
      }
    });

    return NextResponse.json(savedSummary);
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
