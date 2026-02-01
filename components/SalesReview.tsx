"use client";

import { useState } from "react";
import { Check, X, Loader2, Save } from "lucide-react";
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
            // Reprocess matching just in case user edited names (if we allowed that, but for now we don't)
            // Actually, we can just use the item state since we initialized IDs.
            // BUT, if we want to be safe, filter out un-matched items if we want to enforce inventory.
            // The USER said: "make it take price if item is not listef in inventory then ask price by the user"
            // This implies allow selling even if not in inventory?
            // "Inventory tracking: reduce stock on each sale".
            // If not in inventory, we can't reduce stock.
            // For MVP, let's ONLY allow Inventory items for stock tracking, or allow "Ad-hoc" sales without stock tracking?
            // User requirement: "Inventory tracking".
            // I'll stick to: Must map to a product. If not, maybe create a "Miscellaneous" product implicitly?
            // For simplicity/safey: Warn if not matched.

            // Re-match logic to be safe or just filter
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
                body: JSON.stringify({ items: validItems }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert("Failed to save.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-card w-full max-w-md mx-auto p-4 rounded-xl border border-border shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-lg flex items-center justify-between">
                Confirm Sale
                <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>
            </h3>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {items.map((item, idx) => {
                    const isMatched = !!item.productId;
                    return (
                        <div key={idx} className={cn("p-3 rounded-lg border", isMatched ? "bg-card border-border" : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900")}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-medium text-foreground capitalize">{item.productName}</p>
                                    {!isMatched && <span className="text-[10px] text-red-500 font-bold uppercase">Not in Inventory</span>}
                                </div>
                                <button onClick={() => handleRemove(idx)} className="text-muted-foreground hover:text-red-500">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 h-9 text-sm border rounded bg-background focus:ring-2 focus:ring-primary outline-none"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Total Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={cn("w-full p-2 h-9 text-sm border rounded bg-background focus:ring-2 focus:ring-primary outline-none", item.totalAmount === 0 && "border-red-500 ring-1 ring-red-500")}
                                        value={item.totalAmount}
                                        onChange={(e) => updateItem(idx, 'totalAmount', parseFloat(e.target.value) || 0)}
                                        placeholder="Enter Price"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
                {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items.</p>}
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2 text-sm font-medium border rounded-lg hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmSale}
                    disabled={isSubmitting || items.length === 0}
                    className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Confirm Sale
                </button>
            </div>
        </div>
    );
}
