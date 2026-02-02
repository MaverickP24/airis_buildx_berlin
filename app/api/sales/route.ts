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

    sales.forEach((sale: any) => {
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
    const { items, paymentMode, autoAdjustStock } = await req.json(); 
    if (!items || !Array.isArray(items)) {
        return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const results: any[] = [];
    
    await prisma.$transaction(async (tx: any) => {
      for (const item of items) {
        let productId = item.productId ? parseInt(item.productId) : null;
        const qtyToSell = parseInt(item.quantity);
        const totalAmount = parseFloat(item.totalAmount);
        const unitPrice = totalAmount / qtyToSell;

        // 1. If no productId, create the product automatically
        if (!productId) {
          const newProduct = await tx.product.create({
            data: {
              name: item.productName || "Unnamed Product",
              costPrice: unitPrice * 0.7, // Assume 30% margin default
              sellingPrice: unitPrice,
              stock: qtyToSell, // Set initial stock to match sale so it ends at 0
              category: "Miscellaneous"
            }
          });
          productId = newProduct.id;
        }

        // 2. Handle Stock Adjustment if requested
        if (autoAdjustStock) {
            const currentProduct = await tx.product.findUnique({
                where: { id: productId }
            });
            if (currentProduct && currentProduct.stock < qtyToSell) {
                await tx.product.update({
                    where: { id: productId },
                    data: { stock: qtyToSell }
                });
            }
        }

        // 3. Create Sale
        const sale = await tx.sale.create({
          data: {
            productId: productId,
            quantity: qtyToSell,
            totalAmount: totalAmount,
            paymentMode: paymentMode || "CASH"
          }
        });

        // 4. Update Stock (Decrement)
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
                decrement: qtyToSell
            }
          }
        });

        // 5. Safety Net: Fix negative stock if it somehow happened
        if (updatedProduct.stock < 0) {
            await tx.product.update({
                where: { id: productId },
                data: { stock: 0 }
            });
        }
        results.push(sale);
      }
    });

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record sales" }, { status: 500 });
  }
}
