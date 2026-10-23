import React, { useState } from "react";
import { Product } from "../../types";
import { api } from "../../services/api";
import { X, Package, Check, AlertCircle, Loader2 } from "lucide-react";

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UNITS = ["pcs", "bags", "sheets", "rolls", "meters", "buckets", "sets", "boxes", "kg"];

const CATEGORIES = [
  "Cement & Aggregates",
  "Roofing",
  "Steel & Metals",
  "Plumbing",
  "Paints & Finishes",
  "Electrical",
  "Hardware & Tools",
  "Finishing & Boards",
  "General",
];

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(product);
  const [name, setName] = useState(product?.name || "");
  const [sku, setSku] = useState(product?.sku || "");
  const [barcode, setBarcode] = useState(product?.barcode || "");
  const [category, setCategory] = useState(product?.category || "Cement & Aggregates");
  const [unit, setUnit] = useState(product?.unit || "pcs");
  const [buyingPrice, setBuyingPrice] = useState<number>(
    product ? Number(product.buying_price) : 10000
  );
  const [sellingPrice, setSellingPrice] = useState<number>(
    product ? Number(product.selling_price) : 12500
  );
  const [quantity, setQuantity] = useState<number>(product ? product.quantity : 50);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    product ? product.low_stock_threshold : 10
  );
  const [description, setDescription] = useState(product?.description || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const margin =
    sellingPrice > 0 ? (((sellingPrice - buyingPrice) / sellingPrice) * 100).toFixed(1) : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        sku: sku || undefined,
        barcode: barcode || undefined,
        category,
        unit,
        buying_price: Number(buyingPrice),
        selling_price: Number(sellingPrice),
        quantity: Number(quantity),
        low_stock_threshold: Number(lowStockThreshold),
        description: description || undefined,
      };

      if (isEditing && product) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2 text-brand-400">
            <Package className="w-5 h-5" />
            <h2 className="font-bold text-slate-100 text-sm">
              {isEditing ? `Edit Product: ${product?.name}` : "Create New Catalog Product"}
            </h2>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          {/* Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Product Title / Description</label>
            <input
              type="text"
              placeholder="e.g. Cimerwa Cement 32.5R (50kg Bag)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Inventory Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKU & Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">SKU Code</label>
              <input
                type="text"
                placeholder="e.g. CEM-325-50"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Barcode</label>
              <input
                type="text"
                placeholder="e.g. 600123456001"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Pricing & Real-time Margin */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
            <div>
              <label className="text-[11px] font-medium text-slate-400">Buying Price (Cost)</label>
              <input
                type="number"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400">Retail Selling Price</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="col-span-2 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Gross Margin:</span>
              <span className="font-mono font-bold text-emerald-400">
                {margin}% ({(sellingPrice - buyingPrice).toLocaleString()} RWF profit/unit)
              </span>
            </div>
          </div>

          {/* Stock Quantities & Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Current Stock Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Low Stock Alert Threshold</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Specifications / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Weatherproof high strength Portland cement"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Submit */}
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Create Product"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
