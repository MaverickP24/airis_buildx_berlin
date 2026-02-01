"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { LayoutDashboard, Box, Settings, Sparkles, AlertCircle, TrendingUp, Package, Loader2 } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import SalesReview from "@/components/SalesReview";
import DashboardStats from "@/components/DashboardStats";

export default function Home() {
  const [summary, setSummary] = useState({ totalSales: 0, totalItems: 0, totalProfit: 0 });
  const [products, setProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewItems, setReviewItems] = useState<any[] | null>(null);

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
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 font-sans">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-40 glass border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">
              Vyapar<span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8 space-y-10">

        {/* Hero Section */}
        <section className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Store <span className="text-indigo-600">Snapshot</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">Real-time business performance</p>
        </section>

        {/* Anomaly Notification */}
        {anomaly && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-5 rounded-3xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 italic">Vigilant Alert</p>
              <p className="text-sm font-bold text-slate-800 dark:text-amber-100">{anomaly}</p>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <DashboardStats summary={summary} lowStockCount={lowStockCount} />

        {/* Monthly Performance Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Performance</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">February 2026</span>
          </div>

          <div className="bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white card-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-32 w-32" />
            </div>

            <div className="relative z-10 space-y-8">
              {monthlyStats ? (
                <>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</p>
                      <p className="text-3xl font-black tracking-tight">₹{monthlyStats.netProfit.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenses</p>
                      <p className="text-3xl font-black tracking-tight text-red-400">₹{monthlyStats.totalExpenses.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/10"></div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Selling</p>
                      {monthlyStats.bestSeller ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-white/10 rounded-lg flex items-center justify-center">
                            <Package className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-bold">{monthlyStats.bestSeller.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-500 italic">No sales yet</span>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode Split</p>
                      <div className="flex gap-4 text-xs font-bold">
                        <span className="text-emerald-400">UPI: {Math.round((monthlyStats.upiSales / (monthlyStats.totalSales || 1)) * 100)}%</span>
                        <span className="text-slate-400">CASH: {Math.round((monthlyStats.cashSales / (monthlyStats.totalSales || 1)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center opacity-40">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Calibrating Stats...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* AI Insight Cards */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">AI Intelligence</h3>
          <div className="grid gap-3">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 card-shadow flex gap-4 items-start group">
                  <div className="p-3 bg-violet-50 dark:bg-violet-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed pt-1">
                    {insight}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Collecting Intelligence...</p>
              </div>
            )}
          </div>
        </section>

        {/* Smart Entry Area */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Entry Engine</h3>
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

        {/* Premium Q&A System */}
        <section className="space-y-4 pb-12">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Business Intelligence Agent</h3>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="min-h-[80px] bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 bg-indigo-600 rounded-md flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Response</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                {answer || "Ask anything: 'How much profit today?' or 'What is my top product?'"}
              </p>
            </div>
            <div className="relative group">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                type="text"
                placeholder="Type your query here..."
                className="w-full h-14 pl-5 pr-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <button
                onClick={handleQuery}
                className="absolute right-2 top-2 h-10 px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                QUERY
              </button>
            </div>
          </div>
        </section>

        {/* Global Expense Entry */}
        <section className="space-y-4 pb-20">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cost Tracking</h3>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Describe expense..."
              className="flex-1 h-12 px-4 text-sm font-bold border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
            />
            <div className="relative w-24">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="0"
                className="w-full h-12 pl-6 pr-3 text-sm font-bold border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddExpense}
              disabled={isAddingExpense}
              className="h-12 w-12 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-2xl flex items-center justify-center font-black hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30"
            >
              {isAddingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : "+"}
            </button>
          </div>
        </section>

      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <nav className="glass rounded-[2rem] p-2 flex items-center justify-between border border-white/20 dark:border-white/10 shadow-2xl">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-3 group">
            <div className="p-2 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30 group-active:scale-95 transition-all text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Hub</span>
          </Link>

          <div className="w-px h-8 bg-slate-200/50 dark:bg-slate-800/50"></div>

          <Link href="/inventory" className="flex-1 flex flex-col items-center gap-1 py-3 group">
            <div className="p-2 rounded-2xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-indigo-600">
              <Box className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Stock</span>
          </Link>

          <div className="w-px h-8 bg-slate-200/50 dark:bg-slate-800/50"></div>

          <div className="flex-1 flex flex-col items-center gap-1 py-3 opacity-30 cursor-not-allowed">
            <div className="p-2 rounded-2xl bg-transparent text-slate-400">
              <Settings className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Setup</span>
          </div>
        </nav>
      </div>
    </main>
  );
}
