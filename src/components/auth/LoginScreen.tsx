import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import {
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  Store,
} from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("rwemera30@gmail.com");
  const [password, setPassword] = useState("Password123!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register form state
  const [regShopName, setRegShopName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regTin, setRegTin] = useState("");
  const [regPassword, setRegPassword] = useState("Password123!");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.registerTenant({
        shopName: regShopName,
        ownerName: regOwnerName,
        email: regEmail,
        phone: regPhone,
        location: regLocation,
        tinNumber: regTin,
        password: regPassword,
      });

      // Automatically sign in
      await login(regEmail, regPassword);
    } catch (err: any) {
      setError(err.message || "Failed to register tenant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("Password123!");
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Brand Banner */}
        <div className="p-8 text-center bg-gradient-to-b from-slate-850 to-slate-900 border-b border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-brand-500/20 font-black text-white text-2xl mb-3">
            V
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">VECTOS ERP</h1>
          <p className="text-xs text-slate-400 mt-1">
            B2B Multi-Tenant Hardware, Materials & Retail Depot Cloud
          </p>

          {/* Mode Switcher */}
          <div className="mt-5 grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "login"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Staff Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "register"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register Tenant
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "login" ? (
          <div className="p-6 space-y-5">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@depot.rw"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-brand-500 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Demo Switcher (Preloaded RBAC Roles):
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => quickFill("rwemera30@gmail.com")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-purple-500/30 text-left transition-colors"
                >
                  <div className="font-bold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Superadmin
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">rwemera30@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("manager@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">Depot Manager</div>
                  <div className="text-[10px] text-slate-400 truncate">manager@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("cashier@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">Head Cashier</div>
                  <div className="text-[10px] text-slate-400 truncate">cashier@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("stock@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">Stock Keeper</div>
                  <div className="text-[10px] text-slate-400 truncate">stock@vectos.rw</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Depot / Store Name</label>
              <input
                type="text"
                placeholder="e.g. Kigali Heavy Materials Depot"
                value={regShopName}
                onChange={(e) => setRegShopName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Owner / Director Name</label>
              <input
                type="text"
                placeholder="e.g. Patrick Rwemera"
                value={regOwnerName}
                onChange={(e) => setRegOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  placeholder="owner@depot.rw"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Phone</label>
                <input
                  type="text"
                  placeholder="+250 788 123 456"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Location</label>
                <input
                  type="text"
                  placeholder="Gikondo Industrial Zone"
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">RRA TIN</label>
                <input
                  type="text"
                  placeholder="100234567"
                  value={regTin}
                  onChange={(e) => setRegTin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Admin Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Tenant...</span>
                </>
              ) : (
                <>
                  <span>Create Store Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
