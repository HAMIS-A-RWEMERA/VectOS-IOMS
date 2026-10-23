import React, { useState, useEffect } from "react";
import { Stock } from "../../types";
import { api } from "../../services/api";
import { Warehouse, Plus, Check, MapPin, User, ShieldCheck } from "lucide-react";

export const DepotManagement: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New depot fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [managerName, setManagerName] = useState("");

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStocks();
      setStocks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    try {
      await api.createStock({
        name,
        code,
        location,
        manager_name: managerName,
        is_main: 0,
      });
      setShowCreateModal(false);
      setName("");
      setCode("");
      setLocation("");
      setManagerName("");
      loadStocks();
    } catch (e) {
      alert("Failed to create depot.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-brand-400" />
            <span>Warehouses & Depots</span>
          </h3>
          <p className="text-xs text-slate-400">
            Physical holding locations, yard dispatch centers, and retail counters
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse / Depot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-100 text-sm">{stock.name}</h4>
                  {stock.is_main === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      Main Depot
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-brand-400">{stock.code}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold uppercase">
                {stock.status || "Active"}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{stock.location || "Central Yard"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager: {stock.manager_name || "Assigned Depot Controller"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100">Register New Depot / Warehouse</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Depot Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nyabugogo Secondary Yard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300">Depot Code</label>
                <input
                  type="text"
                  placeholder="e.g. WH-NYA-02"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300">Location Address</label>
                <input
                  type="text"
                  placeholder="e.g. Nyabugogo Commercial Road"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300">Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diane Mukamana"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Create Depot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
