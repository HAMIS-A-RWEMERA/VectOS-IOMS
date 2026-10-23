import React, { useState } from "react";
import { Customer } from "../../types";
import { api } from "../../services/api";
import { X, CreditCard, Banknote, Smartphone, Building2, Check, AlertCircle, Loader2 } from "lucide-react";

interface PaymentRecordModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  customer,
  onClose,
  onSuccess,
}) => {
  const currentBalance = Number(customer.credit_balance || 0);
  const [amount, setAmount] = useState<number>(currentBalance);
  const [method, setMethod] = useState<"cash" | "momo" | "bank_transfer">("momo");
  const [referenceNo, setReferenceNo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingBalance = Math.max(0, currentBalance - amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Please enter a valid positive payment amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.payCustomerDebt(customer.id, {
        amount,
        payment_method: method,
        reference_no: referenceNo || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CreditCard className="w-5 h-5" />
            <h2 className="font-bold text-slate-100 text-sm">Settle Contractor Debt</h2>
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

        {/* Customer Balance Banner */}
        <div className="p-4 mx-5 mt-4 rounded-xl bg-slate-850 border border-slate-800 flex justify-between items-center text-xs">
          <div>
            <div className="font-bold text-slate-100">{customer.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">{customer.phone}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Debt Owed</span>
            <div className="font-mono text-sm font-black text-rose-400">
              {currentBalance.toLocaleString()} RWF
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Payment Method Pills */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Payment Channel</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod("momo")}
                className={`py-2 px-2.5 rounded-xl border font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  method === "momo"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>MTN / Airtel</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`py-2 px-2.5 rounded-xl border font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  method === "cash"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank_transfer")}
                className={`py-2 px-2.5 rounded-xl border font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  method === "bank_transfer"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Bank Wire</span>
              </button>
            </div>
          </div>

          {/* Amount to Pay */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="font-semibold text-slate-300">Amount Tendered</label>
              <button
                type="button"
                onClick={() => setAmount(currentBalance)}
                className="text-[10px] text-brand-400 hover:underline font-semibold"
              >
                Full Settle ({currentBalance.toLocaleString()} RWF)
              </button>
            </div>
            <input
              type="number"
              min="1"
              max={currentBalance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Reference No */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Transaction Reference / Receipt Slip #
            </label>
            <input
              type="text"
              placeholder="e.g. MOMO-918204 or Bank Deposit Slip"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Live Remaining Preview */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Remaining Balance after payment:</span>
            <span className="font-mono font-bold text-white">
              {remainingBalance.toLocaleString()} RWF
            </span>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
