"use client";

import { useState } from "react";
import { X, Save, Loader2, IndianRupee, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
    productName: string;
    quantity: number;
    totalAmount: number;
    productId?: number;
}

interface SalesReviewProps {
    initialItems: Item[];
    onCancel: () => void;
    onSuccess: () => void;
    products: any[];
}

export default function SalesReview({ initialItems, onCancel, onSuccess, products }: SalesReviewProps) {
    // 1. Initialize State with "Smart defaults"
    const [items, setItems] = useState<Item[]>(() => {
        return initialItems.map(item => {
            // Try to find the product
            const matchedProduct = products.find(p =>
                p.name.toLowerCase() === item.productName.toLowerCase() ||
                p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
                item.productName.toLowerCase().includes(p.name.toLowerCase())
            );

            // Logic:
            // - If API gave a price > 0, trust the user's voice input.
            // - If API gave 0 (user didn't say price), use Inventory Selling Price.
            // - If not in inventory, default to 0 (user must enter it).
            let amount = item.totalAmount;
            if (amount === 0 && matchedProduct) {
                amount = (matchedProduct.sellingPrice || matchedProduct.costPrice || 0) * item.quantity;
            }

            return {
                ...item,
                totalAmount: amount,
                productId: matchedProduct?.id // Store matched ID
            };
        });
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");

    // Helpers to update state
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemove = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };


    const confirmSale = async () => {
        // Validate
        const missingPrice = items.some(i => i.totalAmount <= 0);
        if (missingPrice) {
            alert("Please enter a valid price for all items.");
            return;
        }

        setIsSubmitting(true);
        try {
            const validItems = items.filter(i => i.productId); // Only items with IDs

            if (validItems.length === 0) {
                alert("No valid inventory products found. Please add products to Inventory first.");
                setIsSubmitting(false);
                return;
            }

            if (validItems.length !== items.length) {
                if (!confirm(`${items.length - validItems.length} items are not in inventory and will be ignored. Continue?`)) {
                    setIsSubmitting(false);
                    return;
                }
            }

            const res = await fetch('/api/sales', {
                method: 'POST',
                body: JSON.stringify({
                    items: validItems.map(it => ({ ...it, productId: it.productId })), // Use validItems here
                    paymentMode
                }),
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                alert("Failed to record sales");
            }
        } catch (e) {
            console.error(e);
            alert("Error confirming sale");
        } finally {
            if (!isSuccess) setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-12 rounded-[2.5rem] card-shadow flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-emerald-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sale Recorded!</h3>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Intelligence engine updated successfully</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Sale</h3>
                        <p className="text-xs text-slate-500 font-medium">Please verify items and payment</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Payment Mode */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setPaymentMode("CASH")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                            paymentMode === "CASH"
                                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <IndianRupee className="h-3.5 w-3.5" /> CASH
                    </button>
                    <button
                        onClick={() => setPaymentMode("UPI")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                            paymentMode === "UPI"
                                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Sparkles className="h-3.5 w-3.5" /> UPI
                    </button>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item, idx) => {
                        const isMatched = !!item.productId;
                        return (
                            <div key={idx} className={cn(
                                "p-4 rounded-2xl border transition-all",
                                isMatched
                                    ? "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700"
                                    : "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                            )}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("p-1.5 rounded-lg", isMatched ? "bg-white dark:bg-slate-700" : "bg-white dark:bg-red-900/40")}>
                                            <Package className={cn("h-4 w-4", isMatched ? "text-slate-400" : "text-red-500")} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{item.productName}</p>
                                            {!isMatched && <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-tighter">Unknown Item</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemove(idx)} className="text-slate-300 hover:text-red-500 transition-colors px-1">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest pl-1">Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest pl-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                className={cn(
                                                    "w-full pl-6 pr-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all",
                                                    item.totalAmount === 0 ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-100 dark:border-slate-700"
                                                )}
                                                value={item.totalAmount}
                                                onChange={(e) => updateItem(idx, 'totalAmount', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-slate-400 font-medium">No items found</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={confirmSale}
                        disabled={isSubmitting || items.length === 0}
                        className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Confirm Final Sale
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Discard Entry
                    </button>
                </div>
            </div>
        </div>
    );
}
