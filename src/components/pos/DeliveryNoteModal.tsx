import React from "react";
import { Order, Shop } from "../../types";
import { Printer, X, Truck, Check } from "lucide-react";

interface DeliveryNoteModalProps {
  order: Order | null;
  shop: Shop | null;
  onClose: () => void;
}

export const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({
  order,
  shop,
  onClose,
}) => {
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
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Truck className="w-5 h-5" />
            <span className="font-bold text-slate-100">80mm Goods Dispatch & Delivery Note</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Delivery Note */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center">
          <div
            id="delivery-note"
            className="w-full max-w-[360px] bg-white text-black p-5 rounded-md font-mono text-xs shadow-lg space-y-3"
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
          >
            {/* Header */}
            <div className="text-center space-y-1 border-b border-gray-400 pb-2">
              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold tracking-widest uppercase">
                DELIVERY NOTE / WAYBILL
              </span>
              <h2 className="font-extrabold text-sm tracking-tight uppercase pt-1">
                {shop?.name || "VECTOS HARDWARE DEPOT"}
              </h2>
              <p className="text-[10px] text-gray-700">{shop?.location || "Kigali, Rwanda"}</p>
              <p className="text-[10px] text-gray-700">TIN: {shop?.tin_number}</p>
            </div>

            {/* Dispatch details */}
            <div className="text-[10px] space-y-0.5 border-b border-gray-300 pb-2">
              <div className="flex justify-between">
                <span>ORDER REF:</span>
                <span className="font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE DISPATCHED:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>RECIPIENT / CONTRACTOR:</span>
                <span className="font-bold">{order.customer?.name || "Walk-in Retail"}</span>
              </div>
              {order.customer?.phone && (
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{order.customer.phone}</span>
                </div>
              )}
              {order.notes && (
                <div className="text-gray-700 pt-1">
                  <span className="font-semibold">SITE / NOTES:</span> {order.notes}
                </div>
              )}
            </div>

            {/* Items checklist */}
            <div className="space-y-1.5 border-b border-gray-400 pb-2">
              <div className="flex justify-between font-bold text-[10px] border-b border-gray-200 pb-1">
                <span>ITEM DESCRIPTION</span>
                <span>QTY DISPATCHED</span>
                <span>CHECK</span>
              </div>
              {order.items?.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5 text-[11px]">
                  <span className="font-medium truncate max-w-[190px]">{it.product_name}</span>
                  <span className="font-extrabold">{it.quantity}</span>
                  <span className="w-4 h-4 border border-black inline-block text-center font-bold text-[9px] leading-3">
                    ✓
                  </span>
                </div>
              ))}
            </div>

            {/* Signatures */}
            <div className="pt-2 space-y-4 text-[10px]">
              <div className="flex justify-between pt-4 border-t border-dashed border-gray-400">
                <div>
                  <p className="text-gray-500">Warehouse Controller:</p>
                  <p className="mt-4 border-b border-black w-24"></p>
                </div>
                <div>
                  <p className="text-gray-500">Driver / Transporter:</p>
                  <p className="mt-4 border-b border-black w-24"></p>
                </div>
              </div>

              <div>
                <p className="text-gray-500">Customer Received in Good Order (Signature & Date):</p>
                <p className="mt-5 border-b border-black w-full"></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Delivery Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
