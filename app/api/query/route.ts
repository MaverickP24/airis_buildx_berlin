import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";
import { subDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: "No question" }, { status: 400 });

    // 1. Fetch Context Data (Last 30 days summary)
    // For MVP, we'll fetch daily sales totals
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentSales = await prisma.sale.findMany({
        where: { date: { gte: sevenDaysAgo } },
        include: { product: true },
        orderBy: { date: 'desc' }
    });

    // Simplify data for token efficiency
    const dataContext = recentSales.map((s: any) => ({
        date: s.date.toISOString().split('T')[0],
        product: s.product.name,
        qty: s.quantity,
        amount: s.totalAmount
    }));

    const prompt = `
      You are a smart business assistant for an Indian shopkeeper. Answer the user's question based ONLY on the data below.
      
      DATA (Last 7 Days Sales):
      ${JSON.stringify(dataContext)}

      USER QUESTION: "${question}"

      INSTRUCTIONS:
      - Answer in simple Hinglish (Hindi + English).
      - Be direct and friendly.
      - If data is missing, say "Data nahi hai".
      - Do NOT hallucinate.
      
      Output ONLY the text answer.
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({ answer });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to answer" }, { status: 500 });
  }
}
