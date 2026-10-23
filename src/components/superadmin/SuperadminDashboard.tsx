import React, { useState, useEffect } from "react";
import { SuperadminStats, Shop } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Building,
  DollarSign,
  Store,
  Layers,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export const SuperadminDashboard: React.FC = () => {
  const { setActiveTenant, activeTenantId, shop: currentShop } = useAuth();
  const [stats, setStats] = useState<SuperadminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);

  // New Store Form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [plan, setPlan] = useState("enterprise");

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuperadminOverview();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSwitchTenant = async (shopId: number) => {
    await setActiveTenant(shopId);
    window.location.reload();
  };

  const handleToggleShopStatus = async (shopId: number, currentStatus: string | null) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await api.updateShop(shopId, { status: nextStatus });
      loadStats();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    try {
      await api.createShop({
        name,
        code,
        owner_name: ownerName,
        email,
        phone,
        location,
        tin_number: tinNumber,
        subscription_plan: plan,
      });

      setShowCreateShopModal(false);
      setName("");
      setCode("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setTinNumber("");
      loadStats();
    } catch (e) {
      alert("Failed to create store.");
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading Superadmin multi-tenant HQ...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-slate-950">
      {/* Superadmin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Platform Owner HQ
            </span>
            <span className="text-xs font-mono text-slate-400">rwemera30@gmail.com</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Building className="w-6 h-6 text-purple-400" />
            <span>Cross-Store Network Analytics & Tenant Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Global oversight across all subscribed retail depots, warehouses, and revenues
          </p>
        </div>

        <button
          onClick={() => setShowCreateShopModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Store Tenant</span>
        </button>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Network Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats.totalNetworkRevenue.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">RWF</span>
          </div>
          <p className="text-[11px] text-slate-400">Cumulative sales across all hardware tenants</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Network Order Volume
            </span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {stats.totalNetworkOrders.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">Orders</span>
          </div>
          <p className="text-[11px] text-slate-400">Total customer orders fulfilled</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Stores</span>
            <Store className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-brand-400 font-mono">
            {stats.totalShops} <span className="text-xs font-normal text-slate-400">Tenants</span>
          </div>
          <p className="text-[11px] text-slate-400">Isolated database multi-tenant accounts</p>
        </div>
      </div>

      {/* Tenant Stores Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100">Registered Tenant Store Accounts</h3>
            <p className="text-xs text-slate-400">
              Click "Switch Context" to instantly navigate and operate inside any tenant store
            </p>
          </div>
          <button
            onClick={loadStats}
            className="p-2 rounded-xl bg-slate-850 border border-slate-750 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Store Name & Code</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Tier Plan</th>
                <th className="py-3 px-4 text-right">Orders Fulfilled</th>
                <th className="py-3 px-4 text-right">Store Revenue</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.storeBreakdown.map((s) => {
                const isCurrentActive = s.id === activeTenantId;
                const isActive = s.status === "active";

                return (
                  <tr key={s.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100">{s.name}</span>
                        {isCurrentActive && (
                          <span className="text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-1.5 py-0.2 rounded font-semibold uppercase">
                            Active Context
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{s.location || "Rwanda"}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-mono font-semibold">
                        {s.plan || "enterprise"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                      {s.ordersCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {s.revenue.toLocaleString()} RWF
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleShopStatus(s.id, s.status)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleSwitchTenant(s.id)}
                        disabled={isCurrentActive}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 mx-auto ${
                          isCurrentActive
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isCurrentActive ? "Active" : "Switch Context"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Store Modal */}
      {showCreateShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <Store className="w-4 h-4 text-purple-400" />
              <span>Provision New Retail Tenant Account</span>
            </h3>

            <form onSubmit={handleCreateShop} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Store / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nyarugenge Electrical Supplies Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Tenant Code</label>
                  <input
                    type="text"
                    placeholder="e.g. NYARU-ELEC-02"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Subscription Tier</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="starter">Starter Plan</option>
                    <option value="professional">Professional Plan</option>
                    <option value="enterprise">Enterprise Depot Cloud</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Aline Uwase"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Owner Email</label>
                  <input
                    type="email"
                    placeholder="e.g. aline@nyarugenge-elec.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +250 788 654 321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">RRA TIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 100987654"
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kigali, Commercial Street"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateShopModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Create Tenant Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
