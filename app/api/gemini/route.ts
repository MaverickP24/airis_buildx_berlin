import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    console.log("Using Gemini Model:", model.model);

    const prompt = `
      Extract sales data from this text (Hindi/Hinglish/English).
      Return ONLY a VALID JSON array of objects. Each object must have:
      - productName: string (Standardize name in English if possible)
      - quantity: number
      - totalAmount: number (total price for this quantity. If only unit price is given, calculate total).

      Example Input: "Do Maggi diye 20 rupay ke"
      Example Output: [{"productName": "Maggi", "quantity": 2, "totalAmount": 20}]

      Text: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonString = response.text();

    console.log("Gemini Raw:", jsonString);

    // Clean markdown code blocks if present
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const data = JSON.parse(jsonString);
      return NextResponse.json({ data });
    } catch (e) {
       console.error("JSON Parse Error", e);
       // Fallback or retry? For MVP just error.
       return NextResponse.json({ error: "Could not parse AI response", raw: jsonString }, { status: 500 });
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ 
      error: "Failed to process", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
