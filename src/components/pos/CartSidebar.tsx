import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Customer } from "../../types";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Percent,
  User,
  ArrowRight,
  RotateCcw,
  Edit2,
  Check,
} from "lucide-react";

interface CartSidebarProps {
  onOpenPayment: () => void;
  customers: Customer[];
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  onOpenPayment,
  customers,
}) => {
  const {
    cart,
    customer,
    setCustomer,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    total,
    discount,
    discountType,
    setDiscount,
    updatePrice,
  } = useCart();

  const { hasPermission } = useAuth();
  const canGiveDiscounts = hasPermission("can_give_discounts");
  const [isEditingDiscount, setIsEditingDiscount] = useState<boolean>(false);
  const [discountInput, setDiscountInput] = useState<number>(discount);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);

  const handleSaveDiscount = () => {
    setDiscount(discountInput, discountType);
    setIsEditingDiscount(false);
  };

  const handleStartPriceEdit = (productId: number, currentPrice: number) => {
    setEditingPriceId(productId);
    setPriceInput(currentPrice);
  };

  const handleSavePriceEdit = (productId: number) => {
    updatePrice(productId, priceInput);
    setEditingPriceId(null);
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl shrink-0">
      {/* Cart Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Register Cart</h3>
            <p className="text-[11px] text-slate-400">
              {cart.length} {cart.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            title="Clear Cart"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected Customer / Contractor */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-850/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Customer Account
          </span>
          {customer && Number(customer.credit_balance) > 0 && (
            <span className="text-[10px] text-red-400 font-mono font-semibold">
              Debt: {Number(customer.credit_balance).toLocaleString()} RWF
            </span>
          )}
        </div>
        <select
          value={customer?.id || ""}
          onChange={(e) => {
            const found = customers.find((c) => c.id === Number(e.target.value));
            setCustomer(found || null);
          }}
          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">Walk-in Retail Cash Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.phone || "No phone"})
            </option>
          ))}
        </select>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-300 text-sm">Cart is currently empty</p>
            <p className="text-xs max-w-[200px]">
              Scan barcode or click products from the catalog to begin sales registration.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const currentPrice =
              item.customPrice !== undefined ? item.customPrice : Number(item.product.selling_price);
            const lineSubtotal = currentPrice * item.quantity;
            const isEditing = editingPriceId === item.product.id;

            return (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <h4 className="font-semibold text-slate-200 leading-tight">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.product.sku || item.product.barcode}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Price and Price Edit */}
                  <div className="flex items-center space-x-1.5">
                    {isEditing && canGiveDiscounts ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(Number(e.target.value))}
                          className="w-20 px-1.5 py-0.5 rounded bg-slate-800 border border-brand-500 text-white font-mono text-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePriceEdit(item.product.id)}
                          className="p-1 rounded bg-brand-600 text-white hover:bg-brand-500"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => canGiveDiscounts && handleStartPriceEdit(item.product.id, currentPrice)}
                        className={`flex items-center space-x-1 ${canGiveDiscounts ? "cursor-pointer group text-slate-400 hover:text-brand-300" : "text-slate-300"}`}
                        title={canGiveDiscounts ? "Click to override line price" : "Price locked"}
                      >
                        <span className="font-mono text-slate-300 font-medium">
                          {currentPrice.toLocaleString()} RWF
                        </span>
                        {canGiveDiscounts && <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    )}
                  </div>

                  {/* Qty Steppers */}
                  <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700/80">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/80 text-slate-400">
                  <span>Line Subtotal:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {lineSubtotal.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary & Checkout Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-850 space-y-3">
        {/* Discount section */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Percent className="w-3.5 h-3.5 text-brand-400" />
            <span>Discount:</span>
          </div>

          {!canGiveDiscounts ? (
            <span className="text-[11px] text-slate-400 italic">Discounts Locked</span>
          ) : isEditingDiscount ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(Number(e.target.value))}
                placeholder="RWF"
                className="w-20 px-1.5 py-0.5 rounded bg-slate-800 border border-brand-500 text-white font-mono text-xs"
              />
              <button
                onClick={handleSaveDiscount}
                className="px-2 py-0.5 rounded bg-brand-600 text-white text-[11px]"
              >
                Set
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setDiscountInput(discount);
                setIsEditingDiscount(true);
              }}
              className="font-mono hover:text-brand-300 transition-colors"
            >
              {discountAmount > 0 ? `-${discountAmount.toLocaleString()} RWF` : "+ Add Discount"}
            </button>
          )}
        </div>

        {/* Subtotal */}
        <div className="flex justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-slate-300">{subtotal.toLocaleString()} RWF</span>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700/60 font-bold text-white">
          <span>Total Due</span>
          <span className="text-xl font-mono text-brand-400">{total.toLocaleString()} RWF</span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onOpenPayment}
          disabled={cart.length === 0}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 transition-all"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
