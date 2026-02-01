import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  
  const date = dateParam ? new Date(dateParam) : new Date();
  const start = startOfDay(date);
  const end = endOfDay(date);

  try {
    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        product: true
      },
      orderBy: { date: 'desc' }
    });

    // Calculate Summary
    let totalSales = 0;
    let totalItems = 0;
    let totalCost = 0;

    sales.forEach(sale => {
       totalSales += sale.totalAmount;
       totalItems += sale.quantity;
       totalCost += (sale.product.costPrice * sale.quantity);
    });

    const totalProfit = totalSales - totalCost;

    return NextResponse.json({
       sales,
       summary: {
         totalSales,
         totalItems,
         totalProfit
       }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching sales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json(); 
    if (!items || !Array.isArray(items)) {
        return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const results = [];
    
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Create Sale
        const sale = await tx.sale.create({
          data: {
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            totalAmount: parseFloat(item.totalAmount)
          }
        });

        // Update Stock
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: {
            stock: {
              decrement: parseInt(item.quantity)
            }
          }
        });
        results.push(sale);
      }
    });

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record sales" }, { status: 500 });
  }
}
