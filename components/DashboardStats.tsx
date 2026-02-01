import { IndianRupee, TrendingUp, Package, AlertCircle } from "lucide-react";

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
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-2 opacity-90 mb-2">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Today's Sales</span>
                </div>
                <p className="text-2xl font-bold">₹{summary.totalSales.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-2 opacity-90 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Est. Profit</span>
                </div>
                <p className="text-2xl font-bold">₹{summary.totalProfit.toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Items Sold</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{summary.totalItems}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <AlertCircle className={lowStockCount > 0 ? "h-4 w-4 text-red-500" : "h-4 w-4"} />
                    <span className="text-xs font-medium uppercase tracking-wider">Stock Alerts</span>
                </div>
                <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {lowStockCount > 0 ? (
                        <span className="text-red-500 font-bold">{lowStockCount} Low</span>
                    ) : (
                        <span className="text-green-600 text-sm">Everything OK</span>
                    )}
                </p>
            </div>
        </div>
    );
}
