import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { Customer, Order, Shop } from "../../types";
import { api } from "../../services/api";
import {
  X,
  Banknote,
  Smartphone,
  Building2,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface PaymentModalProps {
  customers: Customer[];
  onClose: () => void;
  onSuccess: (order: Order, shop: Shop) => void;
}

type PaymentMethod = "cash" | "momo" | "bank_transfer" | "debt_credit";

export const PaymentModal: React.FC<PaymentModalProps> = ({
  customers,
  onClose,
  onSuccess,
}) => {
  const { cart, customer, setCustomer, total, clearCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState<number>(total);
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(
    customer ? customer.id : ""
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cash change computation
  const change = Math.max(0, amountPaid - total);
  const debt = Math.max(0, total - amountPaid);

  const handleMethodChange = (m: PaymentMethod) => {
    setMethod(m);
    if (m === "debt_credit") {
      setAmountPaid(0);
    } else {
      setAmountPaid(total);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === "debt_credit" && !selectedCustomerId) {
      setError("Please select a registered contractor or customer for debt/credit accounts.");
      return;
    }

    if (method === "momo" && !referenceNo) {
      setError("MTN MoMo / Airtel Money transaction reference is required.");
      return;
    }

    if (method === "bank_transfer" && !referenceNo) {
      setError("Bank transfer reference code is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        selling_price: item.customPrice !== undefined ? item.customPrice : Number(item.product.selling_price),
      }));

      const res = await api.createOrder({
        customer_id: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        notes: notes || undefined,
        items: itemsPayload,
        payment: {
          amount: method === "debt_credit" ? 0 : Math.min(amountPaid, total),
          payment_method: method,
          reference_no: referenceNo || undefined,
        },
      });

      clearCart();
      onSuccess(res.order, res.shop);
    } catch (err: any) {
      setError(err.message || "Failed to process checkout transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <h2 className="font-bold text-slate-100 text-base">Process POS Payment & Checkout</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="p-5 bg-gradient-to-r from-brand-900/60 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-brand-300 font-semibold uppercase tracking-wider">
              Total Amount Payable
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {total.toLocaleString()} <span className="text-sm font-normal text-slate-400">RWF</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Cart Total</span>
            <div className="text-xs font-semibold text-slate-300">{cart.length} line items</div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Customer / Contractor Account
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setSelectedCustomerId(val);
                const found = customers.find((c) => c.id === val);
                setCustomer(found || null);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="">Walk-in Retail Customer (Cash Sale)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {Number(c.credit_balance) > 0 ? `(Debt: ${Number(c.credit_balance).toLocaleString()} RWF)` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleMethodChange("cash")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === "cash"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange("momo")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === "momo"
                    ? "bg-amber-600/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>MTN / Airtel</span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange("bank_transfer")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === "bank_transfer"
                    ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bank Wire</span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange("debt_credit")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  method === "debt_credit"
                    ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-md shadow-purple-500/10"
                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Client Debt</span>
              </button>
            </div>
          </div>

          {/* Dynamic Payment Details */}
          {method === "cash" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
              <div>
                <label className="text-[11px] font-medium text-slate-400">Amount Tendered</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400">Change Due</label>
                <div className="mt-1 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/60 text-emerald-400 font-mono text-sm font-bold">
                  {change.toLocaleString()} RWF
                </div>
              </div>
            </div>
          )}

          {(method === "momo" || method === "bank_transfer") && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
              <div>
                <label className="text-[11px] font-medium text-slate-400">
                  {method === "momo" ? "MoMo Transaction Ref / Phone" : "Bank Transfer Slip / Txn ID"}
                </label>
                <input
                  type="text"
                  placeholder={method === "momo" ? "e.g. MOMO-984214 or 0788123456" : "e.g. BK-TXN-839210"}
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400">Amount Paid</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {method === "debt_credit" && (
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
              <span className="font-bold text-purple-300">Contractor Credit Ledger Entry</span>
              <p className="text-slate-400 text-[11px]">
                The entire amount of <span className="font-bold text-white">{total.toLocaleString()} RWF</span> will be debited to the selected contractor.
              </p>
            </div>
          )}

          {/* Delivery Site / Order Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Delivery Site / Order Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Deliver to Kagarama Construction Site Phase 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Checkout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
