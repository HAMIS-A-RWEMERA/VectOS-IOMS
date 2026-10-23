import React, { useState, useEffect } from "react";
import { User } from "../../types";
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
} from "lucide-react";

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [role, setRole] = useState<User["role"]>("cashier");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [perms, setPerms] = useState({
    can_create_orders: 1,
    can_process_payments: 1,
    can_release_stock: 0,
    can_manage_stock: 0,
    can_view_reports: 1,
    can_give_discounts: 0,
    can_manage_users: 0,
    can_void_orders: 0,
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

  const handleRoleChange = (newRole: User["role"]) => {
    setRole(newRole);
    if (newRole === "manager") {
      setPerms({
        can_create_orders: 1,
        can_process_payments: 1,
        can_release_stock: 1,
        can_manage_stock: 1,
        can_view_reports: 1,
        can_give_discounts: 1,
        can_manage_users: 1,
        can_void_orders: 1,
      });
    } else if (newRole === "cashier") {
      setPerms({
        can_create_orders: 1,
        can_process_payments: 1,
        can_release_stock: 0,
        can_manage_stock: 0,
        can_view_reports: 1,
        can_give_discounts: 0,
        can_manage_users: 0,
        can_void_orders: 0,
      });
    } else if (newRole === "stock_keeper") {
      setPerms({
        can_create_orders: 0,
        can_process_payments: 0,
        can_release_stock: 1,
        can_manage_stock: 1,
        can_view_reports: 1,
        can_give_discounts: 0,
        can_manage_users: 0,
        can_void_orders: 0,
      });
    } else if (newRole === "accountant") {
      setPerms({
        can_create_orders: 0,
        can_process_payments: 1,
        can_release_stock: 0,
        can_manage_stock: 0,
        can_view_reports: 1,
        can_give_discounts: 0,
        can_manage_users: 0,
        can_void_orders: 0,
      });
    }
  };

  const handleTogglePermission = async (targetUser: User, permKey: keyof User) => {
    const currentValue = Boolean(targetUser[permKey]);
    const newValue = currentValue ? 0 : 1;

    try {
      await api.updateUser(targetUser.id, { [permKey]: newValue });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, [permKey]: newValue } : u))
      );
    } catch (e) {
      alert("Failed to update permission.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        name,
        email,
        password,
        role,
        job_title: jobTitle,
        phone,
        ...perms,
      });
      setShowAddModal(false);
      setName("");
      setEmail("");
      setPassword("Password123!");
      setJobTitle("");
      setPhone("");
      loadUsers();
    } catch (e: any) {
      alert(e.message || "Failed to create user.");
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Users2 className="w-6 h-6 text-brand-400" />
            <span>Staff Accounts & Granular RBAC Permissions</span>
          </h2>
          <p className="text-xs text-slate-400">
            Control register access, inventory release rights, and discount authorities
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-brand-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table with Granular Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Job Title</th>
                <th className="py-3 px-2 text-center" title="Can Create Orders in POS">
                  Create Orders
                </th>
                <th className="py-3 px-2 text-center" title="Can Process Payments">
                  Payments
                </th>
                <th className="py-3 px-2 text-center" title="Can Manage & Receive Stock">
                  Stock
                </th>
                <th className="py-3 px-2 text-center" title="Can View Financial Reports">
                  Reports
                </th>
                <th className="py-3 px-2 text-center" title="Can Authorize Discounts">
                  Discounts
                </th>
                <th className="py-3 px-2 text-center" title="Can Manage Users">
                  Users
                </th>
                <th className="py-3 px-2 text-center" title="Can Void Orders">
                  Void
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
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
                            <span className="text-[10px] bg-brand-500/20 text-brand-400 px-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {staff.email} • {staff.phone || "No phone"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-300 capitalize text-xs">
                          {staff.job_title || staff.role}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider bg-slate-800 text-slate-400">
                          {staff.role}
                        </span>
                      </td>

                      {/* Permissions toggles */}
                      {(
                        [
                          "can_create_orders",
                          "can_process_payments",
                          "can_manage_stock",
                          "can_view_reports",
                          "can_give_discounts",
                          "can_manage_users",
                          "can_void_orders",
                        ] as const
                      ).map((permKey) => {
                        const hasPerm = Boolean(staff[permKey]) || isStaffSuperadmin;

                        return (
                          <td key={permKey} className="py-3.5 px-2 text-center">
                            <button
                              disabled={isStaffSuperadmin}
                              onClick={() => handleTogglePermission(staff, permKey)}
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-brand-400" />
                <span>Create Staff Account & Assign Permissions</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eric Mugisha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Email Address (Login)</label>
                  <input
                    type="email"
                    placeholder="e.g. eric@vectos.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +250 788 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Role Preset</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="cashier">Cashier (POS Register)</option>
                    <option value="manager">Store Manager (Full Store Access)</option>
                    <option value="stock_keeper">Stock Keeper (Warehouse & Intake)</option>
                    <option value="accountant">Accountant (Reports & Ledger)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior POS Cashier"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
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

              {/* Granular Permissions Checkboxes */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 text-[11px] block">
                  Permissions Customization
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(perms).map(([key, val]) => (
                    <label key={key} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) =>
                          setPerms((prev) => ({
                            ...prev,
                            [key]: e.target.checked ? 1 : 0,
                          }))
                        }
                        className="rounded border-slate-700 text-brand-600 focus:ring-0"
                      />
                      <span className="capitalize">{key.replace(/can_/g, "").replace(/_/g, " ")}</span>
                    </label>
                  ))}
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
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
