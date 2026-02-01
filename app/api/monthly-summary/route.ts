import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // 1. Sales Summary
    const sales = await prisma.sale.findMany({
        where: { date: { gte: start, lte: end } },
        include: { product: true }
    });

    const totalSales = sales.reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const totalCost = sales.reduce((sum: number, s: any) => sum + (s.product.costPrice * s.quantity), 0);
    const grossProfit = totalSales - totalCost;

    // 2. Expenses Summary
    const expenses = await prisma.expense.findMany({
        where: { date: { gte: start, lte: end } }
    });
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // 3. Net Profit
    const netProfit = grossProfit - totalExpenses;

    // 4. Payment Modes
    const upiSales = sales.filter((s: any) => s.paymentMode === "UPI").reduce((sum: number, s: any) => sum + s.totalAmount, 0);
    const cashSales = sales.filter((s: any) => s.paymentMode !== "UPI").reduce((sum: number, s: any) => sum + s.totalAmount, 0);

    // 5. Best Seller
    const salesByProduct = sales.reduce((acc: any, curr: any) => {
        acc[curr.product.name] = (acc[curr.product.name] || 0) + curr.quantity;
        return acc;
    }, {});
    
    // Explicitly type the sort comparison
    const bestSeller = Object.entries(salesByProduct)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    return NextResponse.json({
        period: "This Month",
        totalSales,
        totalExpenses,
        grossProfit,
        netProfit,
        upiSales,
        cashSales,
        bestSeller: bestSeller ? { name: bestSeller[0], qty: bestSeller[1] } : null
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
