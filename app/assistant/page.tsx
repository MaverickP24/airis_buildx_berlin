"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { LayoutDashboard, Package, Sparkles, Loader2, Send } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import SalesReview from "@/components/SalesReview";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
    const [products, setProducts] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [reviewItems, setReviewItems] = useState<any[] | null>(null);
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [salesHistory, setSalesHistory] = useState([]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/sales');
            if (res.ok) {
                const data = await res.json();
                setSalesHistory(data.sales.slice(0, 5));
            }
        } catch (e) {
            console.error("Fetch history error", e);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                setProducts(await res.json());
            }
        } catch (e) {
            console.error("Fetch products error", e);
        }
    };

    const handleTranscript = async (text: string) => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({ text })
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setReviewItems(json.data);
            } else {
                alert("Error: " + (json.details || json.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error processing voice.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuery = async () => {
        if (!query.trim()) return;
        setAnswer("Thinking...");
        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                body: JSON.stringify({ question: query })
            });
            const data = await res.json();
            setAnswer(data.answer || "Sorry, I couldn't find an answer.");
        } catch (e) {
            setAnswer("Error fetching answer.");
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchHistory();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 pb-32 font-sans selection:bg-primary/20">
            {/* Header */}
            <div className="bg-primary px-6 pt-20 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="max-w-md mx-auto relative z-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight">AI Assistant ✨</h1>
                    <p className="text-blue-100 mt-2 font-medium opacity-90">Bolkar entry karein ya sawaal puche</p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-8 space-y-10">

                {/* Voice Entry section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <h3 className="text-lg font-bold text-gray-800">Voice Sales Engine 🎙️</h3>
                    </div>
                    {!reviewItems ? (
                        <VoiceInput onTranscript={handleTranscript} isProcessing={isProcessing} />
                    ) : (
                        <SalesReview
                            initialItems={reviewItems}
                            products={products}
                            onCancel={() => setReviewItems(null)}
                            onSuccess={() => {
                                setReviewItems(null);
                                fetchProducts();
                                fetchHistory();
                            }}
                        />
                    )}
                </section>

                {/* History Section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 px-1">Recent Entries ⏳</h3>
                    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
                        {salesHistory.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {salesHistory.map((sale: any) => (
                                    <div key={sale.id} className="p-5 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">{sale.product?.name || "Old Sale"}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sale.quantity} units • {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900 tracking-tighter">₹{sale.totalAmount}</p>
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                                sale.paymentMode === "UPI" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                            )}>
                                                {sale.paymentMode}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center italic text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                No entries yet today.<br />
                                <span className="text-[10px] text-primary mt-1 block">Start by recording a sale.</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* AI Chat section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 px-1">Business AI Chat 🤖</h3>
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-none space-y-6">
                        <div className="min-h-[60px] bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-4 bg-primary rounded-md flex items-center justify-center">
                                    <Sparkles className="h-2 w-2 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assistant response</span>
                            </div>
                            <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                                {answer || "Puchiye: 'Top product kya hai?' or 'Today's profit?'"}
                            </p>
                        </div>
                        <div className="relative group">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                                type="text"
                                placeholder="Type your question..."
                                className="w-full h-14 pl-5 pr-16 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                            <button
                                onClick={handleQuery}
                                className="absolute right-2 top-2 h-10 px-4 bg-primary text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-all"
                            >
                                ASK
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.05)] z-50">
                <div className="flex justify-around items-center h-20 max-w-md mx-auto">
                    <Link href="/" className="flex flex-col items-center justify-center space-y-1 w-full text-gray-400 hover:text-gray-600 transition-all group">
                        <div className="p-2 rounded-2xl transition-all">
                            <LayoutDashboard className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
                    </Link>

                    <Link href="/assistant" className="flex flex-col items-center justify-center space-y-1 w-full text-primary group">
                        <div className="p-2 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all">
                            <Sparkles className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Assistant</span>
                    </Link>

                    <Link href="/inventory" className="flex flex-col items-center justify-center space-y-1 w-full text-gray-400 hover:text-gray-600 transition-all group">
                        <div className="p-2 rounded-2xl transition-all">
                            <Package className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Stock</span>
                    </Link>
                </div>
            </nav>
        </main>
    );
}
