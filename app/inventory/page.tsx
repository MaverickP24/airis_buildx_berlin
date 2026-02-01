"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { ArrowLeft, Plus, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Inventory() {
    const [products, setProducts] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", costPrice: "", stock: "", category: "Snacks" });
    const [search, setSearch] = useState("");

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        if (res.ok) setProducts(await res.json());
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.costPrice) return;

        await fetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(newProduct)
        });
        setNewProduct({ name: "", costPrice: "", stock: "", category: "Snacks" });
        setIsAdding(false);
        fetchProducts();
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 p-4">
                <div className="flex items-center gap-4 max-w-md mx-auto">
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold">Inventory</h1>
                </div>
            </header>

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* Search & Add */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 transition-colors shadow-lg"
                    >
                        <Plus className="h-6 w-6" />
                    </button>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md space-y-3 border border-violet-100 dark:border-violet-900 animate-in slide-in-from-top-2">
                        <h3 className="font-semibold text-violet-900 dark:text-violet-300">Add New Product</h3>
                        <input
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-violet-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                            placeholder="Product Name (e.g. Maggi)"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-violet-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                placeholder="Price (₹)"
                                value={newProduct.costPrice}
                                onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                                required
                            />
                            <input
                                type="number"
                                className="w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-violet-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                                placeholder="Stock"
                                value={newProduct.stock}
                                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                required
                            />
                            <select
                                className="w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-violet-500 outline-none text-sm dark:bg-slate-800 dark:border-slate-700"
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                            >
                                <option>Snacks</option>
                                <option>Beverages</option>
                                <option>Household</option>
                                <option>Personal Care</option>
                                <option>Dairy</option>
                                <option>Miscellaneous</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700">Save Product</button>
                        </div>
                    </form>
                )}

                {/* Categorized Product List */}
                <div className="space-y-8 pb-10">
                    {Object.entries(
                        filtered.reduce((acc: any, product) => {
                            const cat = product.category || "Miscellaneous";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(product);
                            return acc;
                        }, {}) as Record<string, any[]>
                    ).sort().map(([category, items]) => (
                        <div key={category} className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{category}</h3>
                            <div className="grid gap-3">
                                {items.map((product) => {
                                    const stockPercent = Math.min(100, (product.stock / 50) * 100);
                                    const isLow = product.stock < 10;
                                    return (
                                        <div key={product.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 card-shadow group transition-all hover:translate-x-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white capitalize">{product.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">₹{product.costPrice} • Unit Price</p>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    isLow ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                                )}>
                                                    {isLow ? 'Low Stock' : 'In Stock'}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase italic">{product.stock} Units left</span>
                                                    <span className="text-xs font-black text-slate-900 dark:text-white">₹{product.costPrice}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            isLow ? "bg-amber-500" : "bg-emerald-500"
                                                        )}
                                                        style={{ width: `${stockPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-20 opacity-40">
                            <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-sm font-bold text-slate-500">No products matching your search</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

