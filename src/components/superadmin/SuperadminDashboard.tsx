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
  AlertTriangle,
  Check,
  X,
  UserCheck,
  LifeBuoy,
  ShieldAlert,
} from "lucide-react";

export const SuperadminDashboard: React.FC = () => {
  const { setActiveTenant, activeTenantId, shop: currentShop } = useAuth();
  const [stats, setStats] = useState<SuperadminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Store Form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [plan, setPlan] = useState("enterprise");

  // New Support Agent Form
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [supportPassword, setSupportPassword] = useState("SupportPass123!");

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

  const handleApproveShop = async (shopId: number, shopName: string) => {
    try {
      const res = await api.approveShop(shopId, "Approved by Platform Owner (Patrick Rwemera)");
      setActionMessage(`Store '${shopName}' has been approved and activated! The owner now has full access.`);
      loadStats();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (e: any) {
      alert(e.message || "Failed to approve shop.");
    }
  };

  const handleRejectShop = async (shopId: number, shopName: string) => {
    const reason = prompt(`Enter rejection reason for '${shopName}':`, "Incomplete documentation or unverified TIN number");
    if (!reason) return;

    try {
      await api.rejectShop(shopId, reason);
      setActionMessage(`Store '${shopName}' has been rejected.`);
      loadStats();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (e: any) {
      alert(e.message || "Failed to reject shop.");
    }
  };

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
        status: "active", // Created directly by Superadmin -> active immediately
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

  const handleCreateSupportAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail) return;

    try {
      await api.createUser({
        name: supportName,
        email: supportEmail,
        phone: supportPhone,
        password: supportPassword,
        role: "superadmin_support",
        job_title: "Platform Client Success & Support Specialist",
        can_create_orders: 0,
        can_process_payments: 0,
        can_release_stock: 0,
        can_manage_stock: 0,
        can_import_export_stock: 1,
        can_partner_borrow: 0,
        can_view_reports: 1,
        can_view_buying_prices: 0,
        can_give_discounts: 0,
        can_manage_users: 0,
        can_print_full_receipt: 1,
        can_print_delivery_note: 1,
        can_manage_customers: 1,
        can_manage_partners: 1,
        can_void_orders: 0,
        can_edit_company_settings: 0,
        can_view_audit_trail: 1,
        can_reset_passwords: 1,
      });

      setShowSupportModal(false);
      setSupportName("");
      setSupportEmail("");
      setSupportPhone("");
      setActionMessage(`Support Agent account created for ${supportEmail}!`);
      setTimeout(() => setActionMessage(null), 5000);
    } catch (e: any) {
      alert(e.message || "Failed to create support agent.");
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
              <Sparkles className="w-3 h-3 text-purple-400" /> Platform Super Manager HQ
            </span>
            <span className="text-xs font-mono text-slate-400">rwemera30@gmail.com</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Building className="w-6 h-6 text-purple-400" />
            <span>Store Approvals & Cross-Store Network Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Global oversight across all subscribed retail depots, registration approvals, and revenues
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowSupportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <LifeBuoy className="w-4 h-4 text-cyan-400" />
            <span>Add Support Staff</span>
          </button>

          <button
            onClick={() => setShowCreateShopModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Store</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* --- PENDING STORE APPROVALS QUEUE --- */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3.5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Pending Store Registration Queue</span>
                {stats.pendingApprovalsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    {stats.pendingApprovalsCount} Awaiting Approval
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Newly registered stores cannot access their depot until you (SuperAdmin) verify and approve them
              </p>
            </div>
          </div>

          <button
            onClick={loadStats}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {stats.pendingShops.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All store registrations are currently reviewed and up to date.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {stats.pendingShops.map((ps) => (
              <div
                key={ps.id}
                className="p-4 rounded-xl bg-slate-850 border border-slate-750 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{ps.name}</h4>
                      <span className="text-xs font-mono text-brand-400">{ps.code}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold uppercase">
                      Pending Review
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-400">Proprietor:</span>{" "}
                      <span className="font-semibold text-slate-200">{ps.owner_name || "Applicant"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Email:</span>{" "}
                      <span className="font-mono text-slate-300">{ps.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Phone:</span>{" "}
                      <span className="font-mono text-slate-300">{ps.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">TIN Number:</span>{" "}
                      <span className="font-mono text-amber-300 font-bold">{ps.tin_number || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Location:</span>{" "}
                      <span className="text-slate-300">{ps.location || "Rwanda"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-750 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleRejectShop(ps.id, ps.name)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApproveShop(ps.id, ps.name)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Activate Store</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Stores</span>
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
            <h3 className="font-bold text-sm text-slate-100">All Tenant Stores & Warehouses</h3>
            <p className="text-xs text-slate-400">
              Click "Switch Context" to instantly navigate and operate inside any tenant store
            </p>
          </div>
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
                const isPending = s.status === "pending_approval";

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
                      {isPending ? (
                        <button
                          onClick={() => handleApproveShop(s.id, s.name)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-colors"
                        >
                          Approve Now
                        </button>
                      ) : (
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
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleSwitchTenant(s.id)}
                        disabled={isCurrentActive || isPending}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 mx-auto ${
                          isCurrentActive
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                            : isPending
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isCurrentActive ? "Active" : isPending ? "Unapproved" : "Switch Context"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ARCHITECTURAL GUIDE: THE 8TH ROLE (SUPERADMIN SUPPORT) --- */}
      <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400">
          <LifeBuoy className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-100">
            The 8th Role Concept: Platform Support Specialist (Level 2/3 Support)
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Adding an 8th primary role for <span className="text-cyan-300 font-semibold">SuperAdmin Support Staff</span> is an industry best-practice as VectOS scales. It provides cross-tenant assisted support without compromising platform security:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Core Support Responsibilities & Powers
            </span>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc pl-4">
              <li>Assist store owners with stuck transactions and audit trail verification</li>
              <li>Inspect tenant order numbers, deliveries, and printer troubleshooting</li>
              <li>Reset staff passwords when managers lose credentials (<code className="text-slate-300">can_reset_passwords</code>)</li>
              <li>Pre-screen applicant TIN documents before final SuperAdmin approval</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 space-y-1">
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Strict Security Boundaries (Safeguards)
            </span>
            <ul className="text-slate-400 text-[11px] space-y-1 list-disc pl-4">
              <li>Cannot delete or suspend tenant stores (only Patrick Rwemera has authority)</li>
              <li>Cannot modify platform subscription plans or view merchant banking API keys</li>
              <li>Cannot create other SuperAdmins or override root system settings</li>
              <li>All support agent actions are logged in the immutable audit trail</li>
            </ul>
          </div>
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
                  Create & Activate Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Support Staff Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <LifeBuoy className="w-4 h-4 text-cyan-400" />
                <span>Provision SuperAdmin Support Agent</span>
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupportAgent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Support Staff Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kevin Kalisa"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Support Email (Login)</label>
                <input
                  type="email"
                  placeholder="e.g. support@vectos.rw"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Phone</label>
                <input
                  type="text"
                  placeholder="+250 788 111 222"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Temporary Password</label>
                <input
                  type="text"
                  value={supportPassword}
                  onChange={(e) => setSupportPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Create Support Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
