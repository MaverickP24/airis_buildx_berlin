import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";
import { startOfMonth, subMonths } from "date-fns";

export async function GET() {
  try {
    // 1. Fetch Sales Data (This Month)
    const now = new Date();
    const start = startOfMonth(now);
    
    // Get aggregated sales by Product
    const salesByProduct = await prisma.sale.groupBy({
        by: ['productId'],
        where: { date: { gte: start } },
        _sum: { quantity: true, totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } }
    });

    // Get product details
    const productIds = salesByProduct.map((s: any) => s.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
    });
    
    // Map names
    const enrichedSales = salesByProduct.map((s: any) => {
        const p = products.find((prod: any) => prod.id === s.productId);
        return {
            name: p?.name || "Unknown",
            qty: s._sum.quantity || 0,
            amount: s._sum.totalAmount || 0
        };
    });

    if (enrichedSales.length === 0) {
        return NextResponse.json({ insight: "Abhi koi sales data nahi hai is mahine." });
    }

    // 2. Prepare context for Gemini
    const context = JSON.stringify(enrichedSales.slice(0, 5)); // Top 5
    const prompt = `
      Analyze this sales data for the current month:
      ${context}

      Generate 3 valuable insights in simple Hinglish (Hindi+English mix) for the shopkeeper.
      Examples: "Maggi sabse zyada bik raha hai", "Coke ki sale maintain karein".
      Return ONLY a VALID JSON object with key "insights": ["Insight 1", "Insight 2", "Insight 3"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Clean code blocks
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(text);

    return NextResponse.json(json);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
