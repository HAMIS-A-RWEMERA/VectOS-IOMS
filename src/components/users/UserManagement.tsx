import React, { useState, useEffect } from "react";
import { User, RoleType, CAPABILITY_DEFINITIONS, ROLE_DEFAULT_CAPABILITIES, UserCapabilities } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Users2,
  UserPlus,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  Edit2,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";

const ROLE_OPTIONS: { id: RoleType; name: string; desc: string }[] = [
  { id: "manager", name: "Manager", desc: "Store Owner / Operations Manager (full store authority)" },
  { id: "accountant", name: "Accountant", desc: "Finance & Accounts Lead (payments, margins, profit & loss, EBM)" },
  { id: "storekeeper", name: "Storekeeper", desc: "Warehouse & Inventory Logistics (dispatches, stock releases, transfers)" },
  { id: "salesperson", name: "Salesperson", desc: "Counter sales and client orders" },
  { id: "cashier", name: "Cashier", desc: "POS billing and payment collection" },
  { id: "employee", name: "Employee", desc: "General operations / PR & Customer Relations" },
  { id: "superadmin_support", name: "SuperAdmin Support", desc: "Platform client success & verification specialist" },
];

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [role, setRole] = useState<RoleType>("cashier");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [capabilities, setCapabilities] = useState<UserCapabilities>({
    ...ROLE_DEFAULT_CAPABILITIES["cashier"],
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleSelect = (selectedRole: RoleType) => {
    setRole(selectedRole);
    // Apply template capabilities
    const template = ROLE_DEFAULT_CAPABILITIES[selectedRole] || ROLE_DEFAULT_CAPABILITIES["cashier"];
    setCapabilities({ ...template });

    // Suggest realistic job title if blank
    if (!jobTitle || jobTitle.includes("Cashier") || jobTitle.includes("Manager") || jobTitle.includes("Lead")) {
      switch (selectedRole) {
        case "manager":
          setJobTitle("Store Operations Manager");
          break;
        case "accountant":
          setJobTitle("Finance & Accounts Lead (EBM)");
          break;
        case "storekeeper":
          setJobTitle("Depot Inventory Lead");
          break;
        case "salesperson":
          setJobTitle("Technical Sales Executive");
          break;
        case "cashier":
          setJobTitle("Head POS Cashier");
          break;
        case "employee":
          setJobTitle("PR & Customer Relations Officer");
          break;
        case "superadmin_support":
          setJobTitle("Client Success & Support Specialist");
          break;
      }
    }
  };

  const handleToggleCapability = (capKey: keyof UserCapabilities) => {
    setCapabilities((prev) => ({
      ...prev,
      [capKey]: prev[capKey] ? 0 : 1,
    }));
  };

  const handleToggleInlinePermission = async (targetUser: User, permKey: keyof UserCapabilities) => {
    const currentValue = Boolean(targetUser[permKey]);
    const newValue = currentValue ? 0 : 1;

    try {
      await api.updateUser(targetUser.id, { [permKey]: newValue });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, [permKey]: newValue } : u))
      );
    } catch (e) {
      alert("Failed to update capability flag.");
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setJobTitle(user.job_title || "");
    setPhone(user.phone || "");

    const userCaps: UserCapabilities = {
      can_create_orders: user.can_create_orders ?? 0,
      can_process_payments: user.can_process_payments ?? 0,
      can_release_stock: user.can_release_stock ?? 0,
      can_manage_stock: user.can_manage_stock ?? 0,
      can_import_export_stock: user.can_import_export_stock ?? 0,
      can_partner_borrow: user.can_partner_borrow ?? 0,
      can_view_reports: user.can_view_reports ?? 0,
      can_view_buying_prices: user.can_view_buying_prices ?? 0,
      can_give_discounts: user.can_give_discounts ?? 0,
      can_manage_users: user.can_manage_users ?? 0,
      can_print_full_receipt: user.can_print_full_receipt ?? 0,
      can_print_delivery_note: user.can_print_delivery_note ?? 0,
      can_manage_customers: user.can_manage_customers ?? 0,
      can_manage_partners: user.can_manage_partners ?? 0,
      can_void_orders: user.can_void_orders ?? 0,
      can_edit_company_settings: user.can_edit_company_settings ?? 0,
      can_view_audit_trail: user.can_view_audit_trail ?? 0,
      can_reset_passwords: user.can_reset_passwords ?? 0,
    };
    setCapabilities(userCaps);
    setShowAddModal(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("Password123!");
    setRole("cashier");
    setJobTitle("Head POS Cashier");
    setPhone("");
    setCapabilities({ ...ROLE_DEFAULT_CAPABILITIES["cashier"] });
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name,
          role,
          job_title: jobTitle,
          phone,
          ...capabilities,
        });
      } else {
        await api.createUser({
          name,
          email,
          password,
          role,
          job_title: jobTitle,
          phone,
          ...capabilities,
        });
      }

      setShowAddModal(false);
      loadUsers();
    } catch (e: any) {
      alert(e.message || "Failed to save staff account.");
    }
  };

  const handleResetPassword = async (user: User) => {
    const newPass = prompt(`Enter new temporary password for '${user.name}':`, "Password123!");
    if (!newPass) return;
    try {
      await api.resetUserPassword(user.id, newPass);
      alert(`Password updated for ${user.email}.`);
    } catch (e) {
      alert("Failed to reset password.");
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-bold text-[10px] uppercase tracking-wider">
              Staff & Roles Matrix
            </span>
            <span className="text-xs text-slate-400">7 Core Roles • 16 Capability Checklist</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Users2 className="w-6 h-6 text-brand-400" />
            <span>Staff Roster, Custom Job Titles & Permissions Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Roles act as default templates while access is governed by 16 granular capability checkboxes
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-brand-500/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Roster Cards / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850/60">
          <div>
            <h3 className="font-bold text-sm text-slate-100">Depot Staff Members</h3>
            <p className="text-xs text-slate-400">Click any capability flag checkbox to toggle permissions in real-time</p>
          </div>
          <button
            onClick={loadUsers}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[980px]">
            <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member & Job Title</th>
                <th className="py-3 px-3">Base Role</th>
                <th className="py-3 px-2 text-center" title="1. can_create_orders">1. Create Orders</th>
                <th className="py-3 px-2 text-center" title="2. can_process_payments">2. Payments</th>
                <th className="py-3 px-2 text-center" title="3. can_release_stock">3. Release Stock</th>
                <th className="py-3 px-2 text-center" title="4. can_manage_stock">4. Manage Stock</th>
                <th className="py-3 px-2 text-center" title="7. can_view_reports">7. Reports</th>
                <th className="py-3 px-2 text-center" title="8. can_view_buying_prices">8. Buying Prices</th>
                <th className="py-3 px-2 text-center" title="9. can_give_discounts">9. Discounts</th>
                <th className="py-3 px-2 text-center" title="11. can_print_full_receipt">11. Full Receipt</th>
                <th className="py-3 px-2 text-center" title="12. can_print_delivery_note">12. Delivery Note</th>
                <th className="py-3 px-2 text-center" title="15. can_void_orders">15. Void</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Loading staff accounts...
                  </td>
                </tr>
              ) : (
                users.map((staff) => {
                  const isStaffSuperadmin = staff.role === "superadmin";

                  return (
                    <tr key={staff.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                          <span>{staff.name}</span>
                          {staff.id === currentUser?.id && (
                            <span className="text-[9px] bg-brand-500/20 text-brand-400 border border-brand-500/30 px-1 rounded font-semibold uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-cyan-300 font-medium mt-0.5">
                          {staff.job_title || "Staff Member"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {staff.email} • {staff.phone || "No phone"}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded font-mono uppercase font-bold text-[10px] tracking-wider bg-slate-800 text-slate-300 border border-slate-700/60">
                          {staff.role}
                        </span>
                      </td>

                      {/* Display primary capability toggles */}
                      {(
                        [
                          "can_create_orders",
                          "can_process_payments",
                          "can_release_stock",
                          "can_manage_stock",
                          "can_view_reports",
                          "can_view_buying_prices",
                          "can_give_discounts",
                          "can_print_full_receipt",
                          "can_print_delivery_note",
                          "can_void_orders",
                        ] as (keyof UserCapabilities)[]
                      ).map((permKey) => {
                        const hasPerm = Boolean(staff[permKey]) || isStaffSuperadmin;

                        return (
                          <td key={permKey} className="py-3.5 px-2 text-center">
                            <button
                              disabled={isStaffSuperadmin}
                              onClick={() => handleToggleInlinePermission(staff, permKey)}
                              className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${
                                hasPerm
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-slate-800 text-slate-400 border border-slate-700/60 hover:text-slate-200"
                              } ${isStaffSuperadmin ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {hasPerm ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            title="Edit Permissions & Job Title"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(staff)}
                            title="Reset Staff Password"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal with Full 16 Core Capabilities Checklist */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                <span>
                  {editingUser ? `Configure Staff: ${editingUser.name}` : "Create Staff Account & Customize Checklist"}
                </span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Staff Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Eric Mugisha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Email Address (Login)</label>
                  <input
                    type="email"
                    placeholder="e.g. eric@vectos.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={Boolean(editingUser)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500 disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* 1. Base Role Template */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Primary Role Category</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleSelect(e.target.value as RoleType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500 capitalize"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Custom Job Title */}
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300 flex items-center justify-between">
                    <span>Custom Job Title</span>
                    <span className="text-[10px] text-cyan-400 font-mono">e.g. PR Officer, Logistics Lead</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PR & Customer Relations Officer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Phone</label>
                    <input
                      type="text"
                      placeholder="+250 788 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Temporary Password</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* --- THE 16 CORE CAPABILITIES CHECKLIST --- */}
              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>The 16 Core Capabilities Checklist</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Toggles define the exact screens, buttons, and financial actions this staff member can access
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className="text-[10px] text-brand-400 hover:underline font-semibold"
                  >
                    Reset to Role Preset
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {CAPABILITY_DEFINITIONS.map((cap, idx) => {
                    const isChecked = Boolean(capabilities[cap.key]);

                    return (
                      <div
                        key={cap.key}
                        onClick={() => handleToggleCapability(cap.key)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 select-none ${
                          isChecked
                            ? "bg-brand-600/10 border-brand-500/40 text-slate-100"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <div className="w-4 h-4 rounded bg-brand-500 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800" />
                          )}
                        </div>

                        <div className="text-[11px] leading-tight">
                          <div className="font-bold flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                            <span className={isChecked ? "text-slate-100" : "text-slate-300"}>
                              {cap.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{cap.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  {editingUser ? "Save Capabilities" : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
