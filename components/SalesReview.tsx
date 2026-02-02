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
            // Check for negative inventory on EXISTING products
            let autoAdjustStock = false;
            const stockCheckFailedItems = items.filter(it => {
                const prod = products.find(p => p.id === it.productId);
                return prod && it.quantity > prod.stock;
            });

            if (stockCheckFailedItems.length > 0) {
                const itemNames = stockCheckFailedItems.map(it => it.productName).join(", ");
                const proceed = confirm(
                    `Inventory mismatch: ${itemNames} ${stockCheckFailedItems.length > 1 ? 'have' : 'has'} less stock than you're selling. \n\nShould I increase the stock to match this sale and proceed?`
                );

                if (proceed) {
                    autoAdjustStock = true;
                } else {
                    alert("Submission cancelled to prevent negative inventory.");
                    setIsSubmitting(false);
                    return;
                }
            }

            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(it => ({
                        productId: it.productId,
                        productName: it.productName,
                        quantity: it.quantity,
                        totalAmount: it.totalAmount
                    })),
                    paymentMode,
                    autoAdjustStock
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-sm p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
                    <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Success!</h3>
                        <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest leading-loose">Ledger updated & synchronized.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md p-10 rounded-t-[3.5rem] shadow-2xl space-y-8 animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[95vh] selection:bg-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Review Sale</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Audit Entry before finalizing</p>
                    </div>
                    <button onClick={onCancel} className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {/* Payment Selection - Clean Minimalist style */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Payment Channel</label>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setPaymentMode("CASH")}
                            className={cn(
                                "flex-1 h-16 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-sm transition-all border-2",
                                paymentMode === "CASH"
                                    ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5 scale-[1.02]"
                                    : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                            )}
                        >
                            <IndianRupee className="h-4 w-4" /> CASH
                        </button>
                        <button
                            onClick={() => setPaymentMode("UPI")}
                            className={cn(
                                "flex-1 h-16 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-sm transition-all border-2",
                                paymentMode === "UPI"
                                    ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5 scale-[1.02]"
                                    : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                            )}
                        >
                            <Sparkles className="h-4 w-4" /> UPI
                        </button>
                    </div>
                </div>

                <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                    {items.map((item, idx) => {
                        const isMatched = !!item.productId;
                        return (
                            <div key={idx} className={cn(
                                "p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group",
                                isMatched
                                    ? "bg-gray-50 border-gray-100"
                                    : "bg-red-50/50 border-red-100"
                            )}>
                                {!isMatched && <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Unlinked</div>}

                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0", isMatched ? "bg-white text-gray-400" : "bg-white text-red-500")}>
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 tracking-tight capitalize leading-tight">{item.productName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Line {idx + 1}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemove(idx)} className="h-10 w-10 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full h-14 px-5 bg-white border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-sm">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                className={cn(
                                                    "w-full h-14 pl-8 pr-4 bg-white border-none rounded-2xl text-sm font-extra shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-black text-gray-900",
                                                    item.totalAmount === 0 && "ring-2 ring-red-500/20"
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
                </div>

                <div className="space-y-4 pt-6">
                    <button
                        onClick={confirmSale}
                        disabled={isSubmitting || items.length === 0}
                        className="w-full h-20 bg-primary text-white rounded-[2.5rem] font-black text-sm tracking-[0.2em] uppercase shadow-2xl shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                        Confirm Final
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                        Discard Transaction
                    </button>
                </div>
            </div>
        </div>
    );
}
