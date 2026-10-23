import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  Calculator,
  Boxes,
  CreditCard,
  BarChart3,
  Users2,
  Building,
  AlertTriangle,
  Receipt,
} from "lucide-react";

export type NavTab = "pos" | "inventory" | "debt" | "reports" | "users" | "superadmin";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, lowStockCount = 0 }) => {
  const { user, hasPermission } = useAuth();
  const { itemCount } = useCart();
  const isSuperadmin = user?.role === "superadmin" || user?.email === "rwemera30@gmail.com";

  const navItems = [
    {
      id: "pos" as NavTab,
      label: "POS Register",
      icon: Calculator,
      badge: itemCount > 0 ? `${itemCount} items` : undefined,
      badgeColor: "bg-brand-500 text-white",
      show: hasPermission("can_create_orders"),
    },
    {
      id: "inventory" as NavTab,
      label: "Stock & Warehouses",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      show: true,
    },
    {
      id: "debt" as NavTab,
      label: "Customer Debt Ledger",
      icon: CreditCard,
      badge: undefined,
      show: true,
    },
    {
      id: "reports" as NavTab,
      label: "Reports & Daily Cash",
      icon: BarChart3,
      badge: undefined,
      show: hasPermission("can_view_reports"),
    },
    {
      id: "users" as NavTab,
      label: "Staff & Permissions",
      icon: Users2,
      badge: undefined,
      show: hasPermission("can_manage_users") || isSuperadmin,
    },
    {
      id: "superadmin" as NavTab,
      label: "Superadmin HQ",
      icon: Building,
      badge: "Platform",
      badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      show: isSuperadmin,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Depot Operations
        </div>
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Quick Depot Info Badge */}
      <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span>POS Status</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px]">Online</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed">
          Rwanda RRA TIN & Cashier Session Active
        </div>
      </div>
    </aside>
  );
};
