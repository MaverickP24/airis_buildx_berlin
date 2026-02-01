import { IndianRupee, TrendingUp, Package, AlertCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsProps {
    summary: {
        totalSales: number;
        totalItems: number;
        totalProfit: number;
    };
    lowStockCount?: number;
}

export default function DashboardStats({ summary, lowStockCount = 0 }: StatsProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Sales Card */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 card-shadow transition-all hover:translate-y-[-2px]">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <IndianRupee className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                        <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Sales</h3>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            ₹{summary.totalSales.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                            <ArrowUpRight className="h-3 w-3" /> Live
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Today's Revenue</p>
                </div>
            </div>

            {/* Profit Card */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 card-shadow transition-all hover:translate-y-[-2px]">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <TrendingUp className="h-12 w-12" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Profit</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        ₹{summary.totalProfit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Estimated Earning</p>
                </div>
            </div>

            {/* Items Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 card-shadow transition-all">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Velocity</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalItems}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Orders Fulfilled</p>
            </div>

            {/* Alerts Card */}
            <div className={cn(
                "rounded-3xl p-5 border card-shadow transition-all",
                lowStockCount > 0
                    ? "bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
            )}>
                <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                        "p-2 rounded-xl",
                        lowStockCount > 0 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-slate-50 dark:bg-slate-800"
                    )}>
                        <AlertCircle className={cn(
                            "h-4 w-4",
                            lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
                        )} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">Inventory</span>
                </div>
                <p className={cn(
                    "text-xl font-bold",
                    lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                )}>
                    {lowStockCount > 0 ? `${lowStockCount} Low` : "Optimal"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Stock Health</p>
            </div>
        </div>
    );
}

