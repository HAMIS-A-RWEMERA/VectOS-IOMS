import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Shop } from "../../types";
import {
  Building2,
  ChevronDown,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  Store,
  Layers,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, shop, logout, setActiveTenant, activeTenantId } = useAuth();
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const isSuperadmin = user?.role === "superadmin" || user?.email === "rwemera30@gmail.com";

  useEffect(() => {
    if (isSuperadmin) {
      api.getShops().then(setAllShops).catch(console.error);
    }
  }, [isSuperadmin]);

  const handleSelectTenant = async (shopId: number) => {
    await setActiveTenant(shopId);
    setShowTenantDropdown(false);
    window.location.reload(); // Re-fetch all scoped data
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand & Store context */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 font-black text-white text-lg">
            V
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-tight text-white text-lg">VECTOS</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-semibold uppercase tracking-wider">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Hardware & Retail Depot Cloud</p>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* Active Shop Selector or Display */}
        {isSuperadmin ? (
          <div className="relative">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left"
            >
              <div className="w-6 h-6 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                  <span>{shop?.name || "Select Tenant Shop"}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded font-mono">
                    {shop?.code}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                  {shop?.location || "Kigali Headquarters"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Dropdown */}
            {showTenantDropdown && (
              <div className="absolute left-0 mt-2 w-80 rounded-xl bg-slate-850 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-700/60 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Superadmin Tenant Switcher
                  </span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                    {allShops.length} Stores
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {allShops.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectTenant(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        s.id === activeTenantId
                          ? "bg-brand-600/20 text-brand-300 font-semibold border border-brand-500/30"
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-100">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.code} • {s.location}</div>
                      </div>
                      {s.id === activeTenantId && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 ring-4 ring-brand-400/20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-slate-100">{shop?.name}</span>
            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded font-mono">
              {shop?.code}
            </span>
          </div>
        )}
      </div>

      {/* User profile & actions */}
      <div className="flex items-center space-x-4">
        {isSuperadmin && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Superadmin</span>
          </div>
        )}

        <div className="flex items-center space-x-3 pl-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</div>
            <div className="text-[11px] text-slate-400 capitalize">{user?.job_title || user?.role}</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
