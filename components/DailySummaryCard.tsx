"use client";

import { Check, MessageCircle } from "lucide-react";

interface DailySummaryCardProps {
    summary: string;
    date: string;
}

export default function DailySummaryCard({ summary, date }: DailySummaryCardProps) {
    return (
        <div className="flex flex-col gap-1 items-start w-full transition-all animate-in fade-in slide-in-from-left-4">
            <div className="flex items-center gap-2 mb-1 px-1">
                <div className="bg-emerald-500 h-1.5 w-1.5 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Briefing</span>
            </div>

            <div className="group relative bg-[#DCF8C6] dark:bg-emerald-900/30 p-5 rounded-3xl rounded-tl-none border border-emerald-100 dark:border-emerald-800/20 shadow-lg shadow-emerald-500/5 max-w-[90%]">
                {/* Message Bubble Decoration */}
                <div className="absolute top-0 -left-1.5 w-3 h-3 bg-[#DCF8C6] dark:bg-emerald-900/30 [clip-path:polygon(100%_0,0_0,100%_100%)]"></div>

                <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-emerald-50 leading-relaxed whitespace-pre-wrap">
                        {summary}
                    </p>
                </div>

                <div className="flex justify-end items-center gap-1 mt-3">
                    <span className="text-[9px] font-black text-emerald-700/60 dark:text-emerald-400/60 uppercase tracking-tighter">
                        {date}
                    </span>
                    <div className="flex -space-x-1">
                        <Check className="h-3 w-3 text-sky-500" strokeWidth={3} />
                        <Check className="h-3 w-3 text-sky-500" strokeWidth={3} />
                    </div>
                </div>
            </div>
        </div>
    );
}
