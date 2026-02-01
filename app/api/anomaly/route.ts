import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);

    // 1. Get Today's Sales
    const todaySales = await prisma.sale.aggregate({
        where: { date: { gte: today } },
        _sum: { totalAmount: true }
    });
    const todayTotal = todaySales._sum.totalAmount || 0;

    // 2. Get Avg Sales of last 7 days (excluding today)
    const pastSales = await prisma.sale.groupBy({
        by: ['date'],
        where: { 
            date: { gte: sevenDaysAgo, lt: today } 
        },
        _sum: { totalAmount: true }
    });

    if (pastSales.length === 0) {
        return NextResponse.json({ alert: null });
    }

    const totalPast = pastSales.reduce((acc: number, curr: any) => acc + (curr._sum.totalAmount || 0), 0);
    const avgPast = totalPast / pastSales.length;

    // 3. Simple Anomaly Logic
    // If today is significant (e.g. at least 1 sale) and < 50% of average, or > 200% of average
    // Only flag if it's late in the day? For MVP, just flag purely on numbers.
    
    let alert = null;
    if (todayTotal > 0 && todayTotal < avgPast * 0.5) {
        alert = `Aaj bikri average se kaafi kam hai (Avg: ₹${avgPast.toFixed(0)}).`;
    } else if (todayTotal > avgPast * 2) {
        alert = `Wah! Aaj bikri shaandaar hai (Avg: ₹${avgPast.toFixed(0)} se dugna).`;
    }

    return NextResponse.json({ alert });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}
