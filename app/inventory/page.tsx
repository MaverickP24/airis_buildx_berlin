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
                <div className="space-y-6">
                    {Object.entries(
                        filtered.reduce((acc: any, product) => {
                            const cat = product.category || "Miscellaneous";
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(product);
                            return acc;
                        }, {}) as Record<string, any[]>
                    ).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">{category}</h3>
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-2">Item</th>
                                            <th className="px-4 py-2 text-right">Price</th>
                                            <th className="px-4 py-2 text-right">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {items.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">₹{product.costPrice}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={cn("font-bold px-2 py-0.5 rounded text-xs", product.stock < 10 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No products found.</p>}
                </div>
            </div>
        </main>
    );
}
