import React, { useState } from "react";
import { Product } from "../../types";
import { api } from "../../services/api";
import { X, ArrowDownRight, Check, AlertCircle, Loader2 } from "lucide-react";

interface StockIntakeModalProps {
  products: Product[];
  initialProduct?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockIntakeModal: React.FC<StockIntakeModalProps> = ({
  products,
  initialProduct,
  onClose,
  onSuccess,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number>(
    initialProduct ? initialProduct.id : products[0]?.id || 1
  );
  const selectedProd = products.find((p) => p.id === selectedProductId) || initialProduct;

  const [quantity, setQuantity] = useState<number>(50);
  const [buyingPrice, setBuyingPrice] = useState<number>(
    selectedProd ? Number(selectedProd.buying_price) : 0
  );
  const [sellingPrice, setSellingPrice] = useState<number>(
    selectedProd ? Number(selectedProd.selling_price) : 0
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const margin =
    sellingPrice > 0 ? (((sellingPrice - buyingPrice) / sellingPrice) * 100).toFixed(1) : "0";

  const handleProductChange = (prodId: number) => {
    setSelectedProductId(prodId);
    const p = products.find((prod) => prod.id === prodId);
    if (p) {
      setBuyingPrice(Number(p.buying_price));
      setSellingPrice(Number(p.selling_price));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) {
      setError("Please provide a valid product and positive intake quantity.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.recordStockIntake({
        product_id: selectedProductId,
        quantity: Number(quantity),
        buying_price: Number(buyingPrice),
        selling_price: Number(sellingPrice),
        notes,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to record stock intake.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2 text-brand-400">
            <ArrowDownRight className="w-5 h-5" />
            <h2 className="font-bold text-slate-100 text-sm">Receive Stock Shipment (Intake)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Product selector */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Select Product to Receive</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Intake Quantity */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Quantity Received</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-brand-500"
            />
            {selectedProd && (
              <p className="text-[11px] text-slate-400">
                New resulting inventory will be:{" "}
                <span className="font-bold text-emerald-400">
                  {selectedProd.quantity + Number(quantity)} {selectedProd.unit}
                </span>
              </p>
            )}
          </div>

          {/* Price Tracking & Margin */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
            <div>
              <label className="text-[11px] font-medium text-slate-400">New Buying Price (COGS)</label>
              <input
                type="number"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400">Depot Selling Price</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="col-span-2 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Gross Margin Expected:</span>
              <span className="font-mono font-bold text-emerald-400">
                {margin}% ({(sellingPrice - buyingPrice).toLocaleString()} RWF/unit)
              </span>
            </div>
          </div>

          {/* Supplier Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Supplier Invoice / Delivery Waybill Ref</label>
            <input
              type="text"
              placeholder="e.g. Cimerwa Plant Invoice #89240"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-brand-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Intake</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
