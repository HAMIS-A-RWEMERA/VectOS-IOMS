import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { ProductModal } from "./ProductModal";
import { StockIntakeModal } from "./StockIntakeModal";
import { StockAdjustmentModal } from "./StockAdjustmentModal";
import { MovementsLog } from "./MovementsLog";
import { DepotManagement } from "./DepotManagement";
import {
  Boxes,
  Search,
  Plus,
  ArrowDownRight,
  SlidersHorizontal,
  AlertTriangle,
  Edit2,
  Trash2,
  RefreshCw,
  Layers,
  History,
  Warehouse,
} from "lucide-react";

type InventoryTab = "catalog" | "movements" | "depots";

export const ProductList: React.FC = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<InventoryTab>("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedProductForAction, setSelectedProductForAction] = useState<Product | null>(null);

  const canManageStock = hasPermission("can_manage_stock");

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        lowStock: lowStockOnly,
        search: search || undefined,
      });
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, lowStockOnly, search]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete '${name}'? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (e) {
      alert("Failed to delete product.");
    }
  };

  const handleOpenIntake = (product?: Product) => {
    setSelectedProductForAction(product || null);
    setIsIntakeModalOpen(true);
  };

  const handleOpenAdjustment = (product?: Product) => {
    setSelectedProductForAction(product || null);
    setIsAdjustmentModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-slate-950">
      {/* Header and top tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Boxes className="w-6 h-6 text-brand-400" />
            <span>Hardware Inventory & Warehouses</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock quantities, intake receiving, and margin calculations
          </p>
        </div>

        {/* Action Buttons */}
        {canManageStock && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenIntake()}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              <span>Stock Intake</span>
            </button>

            <button
              onClick={() => handleOpenAdjustment()}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Adjust Stock</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-brand-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === "catalog"
              ? "bg-slate-850 text-brand-400 border border-slate-700/80 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Product Catalog & Stock</span>
        </button>

        <button
          onClick={() => setActiveTab("movements")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === "movements"
              ? "bg-slate-850 text-brand-400 border border-slate-700/80 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Stock Movements & Audit</span>
        </button>

        <button
          onClick={() => setActiveTab("depots")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === "depots"
              ? "bg-slate-850 text-brand-400 border border-slate-700/80 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Warehouse className="w-3.5 h-3.5" />
          <span>Depots / Warehouses</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by title, SKU, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                lowStockOnly
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts</span>
            </button>

            <button
              onClick={loadProducts}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">In Stock</th>
                  <th className="py-3 px-4 text-right">Buying Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Loading inventory...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const buying = Number(p.buying_price);
                    const selling = Number(p.selling_price);
                    const margin = selling > 0 ? (((selling - buying) / selling) * 100).toFixed(1) : "0";
                    const isLow = p.quantity <= p.low_stock_threshold;

                    return (
                      <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-100">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                            <span>SKU: {p.sku || "N/A"}</span>
                            <span>•</span>
                            <span>Barcode: {p.barcode || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          {isLow ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>
                                {p.quantity} {p.unit}
                              </span>
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-400 text-xs">
                              {p.quantity} {p.unit}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {buying.toLocaleString()} RWF
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          {selling.toLocaleString()} RWF
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                            +{margin}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {canManageStock && (
                              <>
                                <button
                                  onClick={() => handleOpenIntake(p)}
                                  title="Receive Stock"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                                >
                                  <ArrowDownRight className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  title="Edit Product"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-slate-800 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id, p.name)}
                                  title="Delete Product"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "movements" && <MovementsLog />}

      {activeTab === "depots" && <DepotManagement />}

      {/* Modals */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={() => {
            setIsProductModalOpen(false);
            loadProducts();
          }}
        />
      )}

      {isIntakeModalOpen && (
        <StockIntakeModal
          products={products}
          initialProduct={selectedProductForAction}
          onClose={() => setIsIntakeModalOpen(false)}
          onSuccess={() => {
            setIsIntakeModalOpen(false);
            loadProducts();
          }}
        />
      )}

      {isAdjustmentModalOpen && (
        <StockAdjustmentModal
          products={products}
          initialProduct={selectedProductForAction}
          onClose={() => setIsAdjustmentModalOpen(false)}
          onSuccess={() => {
            setIsAdjustmentModalOpen(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};
