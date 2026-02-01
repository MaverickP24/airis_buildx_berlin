import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, costPrice, stock } = body;
    
    let category = body.category || "Miscellaneous";

    // AI Categorization if missing
    if (category === "Miscellaneous" || !category) {
        try {
            const prompt = `Classify the product "${name}" into one of these categories: Grocery, Dairy, Snacks, Beverages, Personal Care, Household. Return JSON: {"category": "Snacks"}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const json = JSON.parse(response.text());
            if (json.category) category = json.category;
        } catch (e) {
            console.error("AI Category failed", e);
        }
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(body.sellingPrice || costPrice),
        stock: parseInt(stock),
        category,
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
