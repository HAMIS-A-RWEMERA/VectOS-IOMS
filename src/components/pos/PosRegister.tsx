import React, { useState, useEffect, useRef } from "react";
import { Product, Customer, Order, Shop } from "../../types";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { CartSidebar } from "./CartSidebar";
import { PaymentModal } from "./PaymentModal";
import { ReceiptModal } from "./ReceiptModal";
import { DeliveryNoteModal } from "./DeliveryNoteModal";
import {
  Search,
  Barcode,
  Layers,
  AlertTriangle,
  Plus,
  RefreshCw,
  Package,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Cement & Aggregates",
  "Roofing",
  "Steel & Metals",
  "Plumbing",
  "Paints & Finishes",
  "Electrical",
  "Hardware & Tools",
  "Finishing & Boards",
];

export const PosRegister: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [barcodeQuery, setBarcodeQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [orderShop, setOrderShop] = useState<Shop | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isDeliveryNoteOpen, setIsDeliveryNoteOpen] = useState<boolean>(false);

  const { addToCart } = useCart();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, custs] = await Promise.all([
        api.getProducts({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: searchQuery || undefined,
        }),
        api.getCustomers(),
      ]);
      setProducts(prods);
      setCustomers(custs);
    } catch (err) {
      console.error("Failed to load POS data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  // Barcode quick scan handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    const matched = products.find(
      (p) =>
        p.barcode?.toLowerCase() === barcodeQuery.trim().toLowerCase() ||
        p.sku?.toLowerCase() === barcodeQuery.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched, 1);
      setBarcodeQuery("");
    } else {
      alert(`No product found with barcode/SKU: ${barcodeQuery}`);
    }
  };

  const handleCheckoutSuccess = (order: Order, shop: Shop) => {
    setIsPaymentOpen(false);
    setCompletedOrder(order);
    setOrderShop(shop);
    setIsReceiptOpen(true);
    // Reload products to refresh stock counts
    loadData();
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950">
      {/* Catalog & Search Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
        {/* Top search & barcode toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search hardware by name, brand, or SKU... (e.g. Cement, Rebar, Paint)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-sm"
            />
          </div>

          {/* Barcode scanner quick entry */}
          <form onSubmit={handleBarcodeSubmit} className="relative sm:w-64">
            <Barcode className="w-4 h-4 text-brand-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Scan Barcode & Enter..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-sm font-mono"
            />
          </form>

          <button
            onClick={loadData}
            title="Refresh Catalog"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Categories scrollable pill strip */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading product inventory...
            </div>
          ) : products.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Package className="w-8 h-8 text-slate-400" />
              <p className="font-semibold text-slate-300 text-sm">No items match your criteria</p>
              <p className="text-xs">Try selecting 'All' or clearing search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {products.map((product) => {
                const isLowStock = product.quantity <= product.low_stock_threshold;
                const isOutOfStock = product.quantity <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product, 1)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isOutOfStock
                        ? "bg-slate-900/40 border-slate-800/40 opacity-60 cursor-not-allowed"
                        : "bg-slate-900 border-slate-800 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5"
                    }`}
                  >
                    <div>
                      {/* Category & Stock Tag */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-800 truncate max-w-[120px]">
                          {product.category}
                        </span>

                        {isLowStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{product.quantity} left</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            {product.quantity} {product.unit}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-100 text-xs line-clamp-2 leading-snug group-hover:text-brand-300 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        SKU: {product.sku || "N/A"}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-white font-mono">
                          {Number(product.selling_price).toLocaleString()}
                          <span className="text-[10px] text-slate-400 font-normal ml-0.5">RWF</span>
                        </div>
                      </div>

                      <button
                        disabled={isOutOfStock}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isOutOfStock
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-brand-600/20 text-brand-400 group-hover:bg-brand-600 group-hover:text-white"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        customers={customers}
        onOpenPayment={() => setIsPaymentOpen(true)}
      />

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          customers={customers}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Receipt Modal */}
      {isReceiptOpen && completedOrder && (
        <ReceiptModal
          order={completedOrder}
          shop={orderShop}
          onClose={() => setIsReceiptOpen(false)}
          onOpenDeliveryNote={() => {
            setIsReceiptOpen(false);
            setIsDeliveryNoteOpen(true);
          }}
        />
      )}

      {/* Delivery Note Modal */}
      {isDeliveryNoteOpen && completedOrder && (
        <DeliveryNoteModal
          order={completedOrder}
          shop={orderShop}
          onClose={() => setIsDeliveryNoteOpen(false)}
        />
      )}
    </div>
  );
};
