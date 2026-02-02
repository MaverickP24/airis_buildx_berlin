"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { LayoutDashboard, Package, Search, Plus, X, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Inventory() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [newItem, setNewItem] = useState({
        name: "",
        category: "Snacks",
        stock: "",
        costPrice: "",
        sellingPrice: ""
    });

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.costPrice || !newItem.sellingPrice || !newItem.stock) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                body: JSON.stringify({
                    ...newItem,
                    costPrice: Number(newItem.costPrice),
                    sellingPrice: Number(newItem.sellingPrice),
                    stock: Number(newItem.stock)
                })
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewItem({ name: "", category: "Snacks", stock: "", costPrice: "", sellingPrice: "" });
                fetchProducts();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const categories = ["All", ...Array.from(new Set(products.map(p => p.category || "General")))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <main className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-primary/20">
            <div className="max-w-md mx-auto px-6 pt-12">

                {/* Minimalist Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Stock</h1>
                        <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Inventory Control</p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="h-7 w-7" strokeWidth={3} />
                    </button>
                </div>

                {/* Clean Search Bar */}
                <div className="relative mb-8 group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                        <Search className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full h-16 pl-14 pr-6 bg-white border-none rounded-[2rem] text-sm font-bold shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Stylized Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar -mx-1 px-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all",
                                selectedCategory === cat
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                    : "bg-white text-gray-400 hover:text-gray-600 shadow-sm"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Minimalist Product Stream */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Auditing Stock...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-100 italic">
                            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No stock found</p>
                        </div>
                    ) : (
                        filteredProducts.map((p: any) => (
                            <div
                                key={p.id}
                                className="bg-white p-6 rounded-[2rem] shadow-sm border-none flex justify-between items-center group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h3 className="text-lg font-black text-gray-900 leading-none tracking-tight">{p.name}</h3>
                                        <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">
                                            {p.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-900 font-black tracking-tight">₹{p.sellingPrice}</span>
                                        <span className="opacity-10">/</span>
                                        <span className="text-gray-400">Cost ₹{p.costPrice}</span>
                                        {p.sellingPrice > p.costPrice && (
                                            <span className="text-emerald-500 font-black bg-emerald-50 px-2 py-0.5 rounded ml-2">
                                                ₹{p.sellingPrice - p.costPrice} Profit
                                            </span>
                                        )}
                                        {p.sellingPrice === p.costPrice && (
                                            <span className="text-amber-500 font-extrabold bg-amber-50 px-2 py-0.5 rounded ml-2">
                                                No Profit
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex flex-col items-end">
                                        <p className={cn(
                                            "text-lg font-black tracking-tighter mb-1",
                                            p.stock < 10 ? "text-red-500" : "text-gray-900"
                                        )}>
                                            {p.stock} <span className="text-[10px] text-gray-400">PCS</span>
                                        </p>
                                        <div className="h-1 w-20 bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    p.stock < 10 ? "bg-red-500" : p.stock < 20 ? "bg-amber-400" : "bg-emerald-400"
                                                )}
                                                style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Replicated Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.05)] z-50">
                <div className="flex justify-around items-center h-20 max-w-md mx-auto">
                    <Link href="/" className="flex flex-col items-center justify-center space-y-1 w-full text-gray-400 hover:text-gray-600 transition-all group">
                        <div className="p-2 transition-all">
                            <LayoutDashboard className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
                    </Link>

                    <Link href="/assistant" className="flex flex-col items-center justify-center space-y-1 w-full text-gray-400 hover:text-gray-600 transition-all group">
                        <div className="p-2 transition-all">
                            <Sparkles className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Assistant</span>
                    </Link>

                    <Link href="/inventory" className="flex flex-col items-center justify-center space-y-1 w-full text-primary group">
                        <div className="p-2 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all">
                            <Package className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Stock</span>
                    </Link>
                </div>
            </nav>

            {/* Modal - Minimalist Bottom Sheet Style */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
                    <div className="bg-white w-full max-w-md p-10 rounded-t-[3rem] shadow-2xl animate-in slide-in-from-bottom-full duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">New Item</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Expanding Inventory</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                <X className="h-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Name</label>
                                <input
                                    className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="e.g. Dairy Milk 100g"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                                    <input
                                        className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Dairy"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="0"
                                        value={newItem.stock}
                                        onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Buy Price (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Khareedi daam"
                                        value={newItem.costPrice}
                                        onChange={e => setNewItem({ ...newItem, costPrice: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Sell Price (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full h-16 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Bechne ka daam"
                                        value={newItem.sellingPrice}
                                        onChange={e => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Profit Calculator Hint */}
                            {newItem.costPrice && newItem.sellingPrice && (
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between mb-8 animate-in zoom-in-95 duration-300">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Expected Profit</span>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-emerald-700 leading-none">₹{Number(newItem.sellingPrice) - Number(newItem.costPrice)} <span className="text-[10px] uppercase font-bold opacity-60">per piece</span></p>
                                        <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5 tracking-tighter">Total Margin: {Math.round(((Number(newItem.sellingPrice) - Number(newItem.costPrice)) / (Number(newItem.costPrice) || 1)) * 100)}%</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={handleAddItem}
                                    className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-sm tracking-widest uppercase shadow-2xl shadow-primary/30 hover:opacity-95 transition-all active:scale-[0.98]"
                                >
                                    Register Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
