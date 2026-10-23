import React from "react";
import { Order, Shop } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Printer, X, CheckCircle, FileText, Lock } from "lucide-react";

interface ReceiptModalProps {
  order: Order | null;
  shop: Shop | null;
  onClose: () => void;
  onOpenDeliveryNote?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  shop,
  onClose,
  onOpenDeliveryNote,
}) => {
  const { hasPermission } = useAuth();
  const canPrintFull = hasPermission("can_print_full_receipt");
  const canPrintDelivery = hasPermission("can_print_delivery_note");

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("en-RW", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-RW");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-slate-100">Order Completed</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable 80mm Thermal Receipt Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          <div
            id="thermal-receipt"
            className="w-full max-w-[340px] bg-white text-black p-5 rounded-md font-mono text-xs shadow-lg space-y-3"
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
          >
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
              <h2 className="font-extrabold text-sm tracking-tight uppercase">
                {shop?.name || "VECTOS HARDWARE & DEPOT"}
              </h2>
              <p className="text-[10px] text-gray-700">{shop?.location || "Kigali, Rwanda"}</p>
              <p className="text-[10px] text-gray-700">Tel: {shop?.phone || "+250 788 123 456"}</p>
              <p className="text-[10px] font-bold text-gray-900">TIN: {shop?.tin_number || "100234567"}</p>
            </div>

            {/* Receipt Metadata */}
            <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-400 pb-2">
              <div className="flex justify-between">
                <span>RECEIPT NO:</span>
                <span className="font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{order.salesperson?.name || "Staff Cashier"}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT:</span>
                <span className="font-semibold">{order.customer?.name || "Walk-in Customer"}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border-b border-dashed border-gray-400 pb-2 space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] border-b border-gray-200 pb-1">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL (RWF)</span>
              </div>
              {order.items?.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-medium text-[11px] leading-tight">{item.product_name}</div>
                  <div className="flex justify-between text-[10px] text-gray-700">
                    <span>
                      {item.quantity} x {Number(item.selling_price).toLocaleString()} RWF
                    </span>
                    <span className="font-semibold text-black">
                      {Number(item.subtotal).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1 text-xs border-b border-dashed border-gray-400 pb-2">
              <div className="flex justify-between font-extrabold text-sm pt-1">
                <span>TOTAL DUE:</span>
                <span>{Number(order.total_amount).toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-700">
                <span>AMOUNT PAID:</span>
                <span>{Number(order.paid_amount).toLocaleString()} RWF</span>
              </div>
              {Number(order.debt_amount || 0) > 0 && (
                <div className="flex justify-between text-[11px] font-bold text-red-600 bg-red-50 p-1 rounded">
                  <span>DEBT / CREDIT:</span>
                  <span>{Number(order.debt_amount).toLocaleString()} RWF</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-gray-600 pt-0.5">
                <span>STATUS:</span>
                <span className="font-bold uppercase tracking-wider">{order.payment_status}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="text-center pt-2 space-y-1.5">
              <div className="font-mono text-center tracking-widest font-bold text-[9px] bg-gray-100 py-1 border border-gray-300">
                * {order.order_number} *
              </div>
              <p className="text-[9px] text-gray-600 italic">
                Thank you for your business! Goods once sold in good condition are not returnable without depot receipt.
              </p>
              <p className="text-[8px] text-gray-400">Powered by Vectos ERP Cloud</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          {onOpenDeliveryNote && canPrintDelivery && (
            <button
              onClick={onOpenDeliveryNote}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>80mm Delivery Note</span>
            </button>
          )}

          <div className="flex items-center space-x-2 ml-auto">
            {canPrintFull ? (
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print 80mm Receipt</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Financial Receipt Locked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
