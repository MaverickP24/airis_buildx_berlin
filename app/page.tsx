"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { LayoutDashboard, Box, Settings } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import SalesReview from "@/components/SalesReview";
import DashboardStats from "@/components/DashboardStats";

export default function Home() {
  const [summary, setSummary] = useState({ totalSales: 0, totalItems: 0, totalProfit: 0 });
  const [products, setProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItems, setReviewItems] = useState<any[] | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/products')
      ]);

      if (salesRes.ok) {
        const data = await salesRes.json();
        setSummary(data.summary);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
        const low = data.filter((p: any) => p.stock < 10).length; // < 10 threshold
        setLowStockCount(low);
      }
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const [insights, setInsights] = useState<string[]>([]);
  const [anomaly, setAnomaly] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

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

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/insights');
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setInsights(data.insights);
        if (data.insight) setInsights([data.insight]); // fallback
      }
    } catch (e) { console.error(e); }
  };

  const fetchAnomaly = async () => {
    try {
      const res = await fetch('/api/anomaly');
      if (res.ok) {
        const data = await res.json();
        setAnomaly(data.alert);
      }
    } catch (e) { console.error(e); }
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
    fetchInsights();
    fetchAnomaly();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Vyapar AI
          </h1>
          <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-8 w-full">

        {/* Anomaly Alert */}
        {anomaly && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded text-sm font-medium animate-in slide-in-from-top-2">
            ⚠️ {anomaly}
          </div>
        )}

        {/* Stats Section */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Overview</h2>
          <DashboardStats summary={summary} lowStockCount={lowStockCount} />
        </section>

        {/* Insights Section */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">AI Business Insights</h2>
          <div className="space-y-3">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-violet-100 dark:border-violet-900 border-l-4 border-l-violet-500 shadow-sm text-sm text-gray-700 dark:text-gray-300">
                  ✨ {insight}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">Loading insights...</div>
            )}
          </div>
        </section>

        {/* Action Area */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">New Entry</h2>
          {!reviewItems ? (
            <VoiceInput onTranscript={handleTranscript} isProcessing={isProcessing} />
          ) : (
            <SalesReview
              initialItems={reviewItems}
              products={products}
              onCancel={() => setReviewItems(null)}
              onSuccess={() => {
                setReviewItems(null);
                fetchData();
              }}
            />
          )}
        </section>

        {/* Q&A Section */}
        <section className="pb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Ask Your Business</h2>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 min-h-[40px] bg-slate-50 dark:bg-slate-800 p-3 rounded-md whitespace-pre-wrap">
              {answer || "Ask a question like \"Aaj ka profit kya hai?\""}
            </div>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                type="text"
                placeholder="Ask here..."
                className="flex-1 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none dark:bg-slate-800 dark:border-slate-700"
              />
              <button
                onClick={handleQuery}
                className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                <span className="text-xs font-bold px-2">ASK</span>
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-md mx-auto w-full">
          <Link href="/" className="flex flex-col items-center p-2 text-violet-600 dark:text-violet-400">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-[10px] font-bold mt-1">Home</span>
          </Link>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <Link href="/inventory" className="flex flex-col items-center p-2 text-gray-400 hover:text-violet-500 transition-colors">
            <Box className="h-6 w-6" />
            <span className="text-[10px] font-medium mt-1">Inventory</span>
          </Link>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex flex-col items-center p-2 text-gray-300 cursor-not-allowed">
            <Settings className="h-6 w-6" />
            <span className="text-[10px] font-medium mt-1">Settings</span>
          </div>
        </div>
      </nav>
    </main>
  );
}
