import React, { useState } from "react";
import { Product } from "../../types";
import { api } from "../../services/api";
import { X, SlidersHorizontal, Check, AlertCircle, Loader2 } from "lucide-react";

interface StockAdjustmentModalProps {
  products: Product[];
  initialProduct?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  products,
  initialProduct,
  onClose,
  onSuccess,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number>(
    initialProduct ? initialProduct.id : products[0]?.id || 1
  );
  const selectedProd = products.find((p) => p.id === selectedProductId) || initialProduct;

  const [quantityDelta, setQuantityDelta] = useState<number>(-1);
  const [movementType, setMovementType] = useState<"Adjustment" | "Damage" | "Return">("Damage");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantityDelta === 0) {
      setError("Please provide a valid product and non-zero quantity change.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.recordStockAdjustment({
        product_id: selectedProductId,
        quantity_change: Number(quantityDelta),
        movement_type: movementType,
        notes,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to adjust stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2 text-amber-400">
            <SlidersHorizontal className="w-5 h-5" />
            <h2 className="font-bold text-slate-100 text-sm">Stock Adjustment & Damage Log</h2>
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
          {/* Product */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Reason / Movement Type */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Adjustment Reason</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Damage", "Adjustment", "Return"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setMovementType(type);
                    if (type === "Return" && quantityDelta < 0) {
                      setQuantityDelta(Math.abs(quantityDelta));
                    } else if (type === "Damage" && quantityDelta > 0) {
                      setQuantityDelta(-Math.abs(quantityDelta));
                    }
                  }}
                  className={`py-2 px-3 rounded-xl border font-semibold text-xs transition-all ${
                    movementType === type
                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Change */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Quantity Change (Delta: negative for loss/damage, positive for return)
            </label>
            <input
              type="number"
              value={quantityDelta}
              onChange={(e) => setQuantityDelta(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-brand-500"
            />
            {selectedProd && (
              <p className="text-[11px] text-slate-400">
                New resulting stock:{" "}
                <span className="font-bold text-white">
                  {Math.max(0, selectedProd.quantity + Number(quantityDelta))} {selectedProd.unit}
                </span>
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Reason / Audit Explanation</label>
            <input
              type="text"
              placeholder="e.g. Broken packaging during forklift unloading"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Adjustment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
