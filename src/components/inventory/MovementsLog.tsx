import React, { useState, useEffect } from "react";
import { InventoryMovement } from "../../types";
import { api } from "../../services/api";
import { History, RefreshCw, ArrowUpRight, ArrowDownRight, AlertOctagon, Undo2 } from "lucide-react";

export const MovementsLog: React.FC = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadMovements = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMovements();
      setMovements(data);
    } catch (e) {
      console.error("Failed to load movements:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const getBadge = (type: string) => {
    switch (type) {
      case "Stock Received":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: ArrowDownRight,
        };
      case "Sale":
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: ArrowUpRight,
        };
      case "Damage":
        return {
          bg: "bg-red-500/10 text-red-400 border-red-500/20",
          icon: AlertOctagon,
        };
      case "Return":
        return {
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: Undo2,
        };
      default:
        return {
          bg: "bg-slate-700/50 text-slate-300 border-slate-600/30",
          icon: History,
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-4 h-4 text-brand-400" />
            <span>Inventory Movement Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-400">
            Immutable log of all stock intakes, POS sales, and damage write-offs
          </p>
        </div>
        <button
          onClick={loadMovements}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-850/70 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Movement Type</th>
              <th className="py-3 px-4 text-right">Quantity Delta</th>
              <th className="py-3 px-4 text-right">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                  Loading audit log...
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No stock movements recorded yet.
                </td>
              </tr>
            ) : (
              movements.map((m) => {
                const badge = getBadge(m.movement_type);
                const Icon = badge.icon;
                const isPositive = m.quantity > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {m.created_at ? new Date(m.created_at).toLocaleString() : "Just now"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {m.product_name || `Product #${m.product_id}`}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${badge.bg}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{m.movement_type}</span>
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold text-xs ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-medium">
                      {m.performed_by_name || "Authorized Staff"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
