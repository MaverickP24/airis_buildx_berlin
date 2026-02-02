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
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-none transition-all hover:translate-y-[-2px] hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Sales</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">
                            ₹{summary.totalSales.toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </div>

            {/* Profit Card */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-none transition-all hover:translate-y-[-2px] hover:shadow-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-primary/5 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Profit</h3>
                    <p className="text-3xl font-black text-gray-900 mt-1 tracking-tighter">
                        ₹{summary.totalProfit.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Net Earned</p>
                </div>
            </div>

            {/* Velocity Card */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-none transition-all">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Items</h3>
                    <p className="text-3xl font-black text-gray-900 mt-1 tracking-tighter">{summary.totalItems}</p>
                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Pcs Sold</p>
                </div>
            </div>

            {/* Health Card */}
            <div className={cn(
                "p-6 rounded-[2.5rem] shadow-sm border-none transition-all",
                lowStockCount > 0 ? "bg-red-50" : "bg-white"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center",
                        lowStockCount > 0 ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-gray-50 text-gray-400"
                    )}>
                        <AlertCircle className="h-5 w-5" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Stock</h3>
                    <p className={cn(
                        "text-2xl font-black mt-1 tracking-tighter",
                        lowStockCount > 0 ? "text-red-500" : "text-gray-900"
                    )}>
                        {lowStockCount > 0 ? `${lowStockCount} Low` : "Healthy"}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Inventory Status</p>
                </div>
            </div>
        </div>
    );
}

