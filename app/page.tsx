"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { LayoutDashboard, Box, Settings, Sparkles, AlertCircle, TrendingUp, Package, Loader2 } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import SalesReview from "@/components/SalesReview";
import DashboardStats from "@/components/DashboardStats";
import DailySummaryCard from "@/components/DailySummaryCard";

export default function Home() {
  const [summary, setSummary] = useState({ totalSales: 0, totalItems: 0, totalProfit: 0 });
  const [products, setProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItems, setReviewItems] = useState<any[] | null>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const fetchMonthlyStats = async () => {
    try {
      const res = await fetch('/api/monthly-summary');
      if (res.ok) {
        setMonthlyStats(await res.json());
      }
    } catch (e) { console.error(e); }
  };

  const handleAddExpense = async () => {
    if (!expenseTitle || !expenseAmount) return;
    setIsAddingExpense(true);
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          title: expenseTitle,
          amount: expenseAmount
        })
      });
      setExpenseTitle("");
      setExpenseAmount("");
      fetchMonthlyStats(); // Refresh stats
    } catch (e) {
      alert("Failed to add expense");
    } finally {
      setIsAddingExpense(false);
    }
  };

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/products')
      ]);

      if (salesRes.ok) {
        const data = await salesRes.json();
        setSummary(data.summary);
        fetchMonthlyStats();
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
        const low = data.filter((p: any) => p.stock < 10).length;
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
    fetchData();
    fetchInsights();
    fetchAnomaly();
    fetchDailySummary();
  }, []);

  const fetchDailySummary = async () => {
    try {
      const res = await fetch('/api/daily-summary');
      if (res.ok) {
        const data = await res.json();
        setDailySummary(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/daily-summary', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDailySummary(data);
      }
    } catch (e) {
      alert("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-32 font-sans selection:bg-primary/20">
      {/* Asset Manager Style Header */}
      <div className="bg-primary px-6 pt-20 pb-16 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl" />

        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Namaste, Shop Owner! 👋
              </h1>
              <p className="text-blue-100 mt-2 font-medium opacity-90">Aaj ka business kaisa hai?</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-8 space-y-10 pb-20">

        {/* KPI Grid - Replicated from Asset Manager */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border-none transition-all hover:shadow-md group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Sales Today</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">₹{summary.totalSales.toLocaleString()}</h3>
                <p className="text-sm mt-1 font-bold text-emerald-600">+₹{summary.totalProfit.toLocaleString()} Profit</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border-none group transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Sold</p>
                <div className="p-2 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{summary.totalItems}</h3>
              <p className="text-[10px] text-gray-400 mt-1">In {new Date().toLocaleDateString('en-IN', { month: 'short' })}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border-none group transition-all hover:shadow-md">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Split</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500">UPI</span>
                    <span className="text-indigo-600">₹{monthlyStats?.upiSales?.toLocaleString() || 0}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round(((monthlyStats?.upiSales || 0) / (monthlyStats?.totalSales || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500">CASH</span>
                    <span className="text-emerald-600">₹{monthlyStats?.cashSales?.toLocaleString() || 0}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round(((monthlyStats?.cashSales || 0) / (monthlyStats?.totalSales || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Alert */}
        {anomaly && (
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 italic">Attention Required</p>
              <p className="text-sm font-bold text-amber-900 leading-tight">{anomaly}</p>
            </div>
          </div>
        )}

        {/* Daily Summary - WhatsApp Style Digest */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-gray-800">Today's Digest 📝</h3>
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              {isGeneratingSummary ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "REFRESH"
              )}
            </button>
          </div>

          {dailySummary ? (
            <DailySummaryCard
              summary={dailySummary.summaryText}
              date={new Date(dailySummary.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            />
          ) : (
            <div
              onClick={handleGenerateSummary}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-all"
            >
              <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic leading-relaxed">
                Unlock Today's Business Briefing<br />
                <span className="text-[10px] text-primary mt-2 block font-black underline">GENERATE NOW</span>
              </p>
            </div>
          )}
        </section>

        {/* AI Smart Insights */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 px-1">AI Smart Tips 💡</h3>
          <div className="grid gap-4">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border-none shadow-sm flex gap-4 items-start group hover:shadow-md transition-all">
                  <div className="p-3 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-700 leading-relaxed">
                      {insight}
                    </p>
                    <span className="inline-block text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      Smart Hint
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl shadow-sm italic text-xs font-bold text-gray-400 uppercase tracking-widest">
                Scanning patterns...
              </div>
            )}
          </div>
        </section>

        {/* Minimalist Expense Entry */}
        <section className="space-y-4 pb-20">
          <h3 className="text-lg font-bold text-gray-800 px-1">Quick Kharcha Entry 💸</h3>
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-none flex gap-3 items-center">
            <input
              type="text"
              placeholder="Tea, Rent, etc."
              className="flex-1 h-12 px-5 text-sm font-bold border-none bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
            />
            <input
              type="number"
              placeholder="₹"
              className="w-20 h-12 px-4 text-sm font-bold border-none bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
            />
            <button
              onClick={handleAddExpense}
              disabled={isAddingExpense}
              className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black hover:bg-red-100 transition-all border border-red-100 flex-shrink-0"
            >
              {isAddingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : "+"}
            </button>
          </div>
        </section>

      </div>

      {/* Replicated Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          <Link href="/" className="flex flex-col items-center justify-center space-y-1 w-full text-primary group">
            <div className="p-2 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all">
              <LayoutDashboard className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
          </Link>

          <Link href="/assistant" className="flex flex-col items-center justify-center space-y-1 w-full text-gray-400 hover:text-gray-600 transition-all group">
            <div className="p-2 rounded-2xl transition-all">
              <Sparkles className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Assistant</span>
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
