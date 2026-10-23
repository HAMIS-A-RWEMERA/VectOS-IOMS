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
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("rwemera30@gmail.com");
  const [password, setPassword] = useState("Password123!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<{ shopName?: string; message: string } | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<string | null>(null);

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
    setPendingNotice(null);

    try {
      await login(email, password);
    } catch (err: any) {
      if (err.status === "pending_approval") {
        setPendingNotice({
          shopName: err.shopName,
          message: err.message || "Your store is pending verification by SuperAdmin Patrick Rwemera.",
        });
      } else {
        setError(err.message || "Failed to sign in. Please check your email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setRegisteredSuccess(null);

    try {
      const res = await api.registerTenant({
        shopName: regShopName,
        ownerName: regOwnerName,
        email: regEmail,
        phone: regPhone,
        location: regLocation,
        tinNumber: regTin,
        password: regPassword,
      });

      setRegisteredSuccess(res.message);
      setMode("login");
      setEmail(regEmail);
      setPassword(regPassword);
    } catch (err: any) {
      setError(err.message || "Failed to register tenant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("Password123!");
    setPendingNotice(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Brand Banner */}
        <div className="p-7 text-center bg-gradient-to-b from-slate-850 to-slate-900 border-b border-slate-800">
          <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-brand-500/20 font-black text-white text-2xl mb-2.5">
            V
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">VECTOS ERP</h1>
          <p className="text-xs text-slate-400 mt-1">
            B2B Multi-Tenant Hardware & Construction Materials Depot Cloud
          </p>

          {/* Mode Switcher */}
          <div className="mt-4 grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
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
              Register New Store
            </button>
          </div>
        </div>

        {/* Pending Approval Alert Banner */}
        {pendingNotice && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center space-x-2 font-bold text-amber-300">
              <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
              <span>STORE REGISTRATION PENDING APPROVAL</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {pendingNotice.message}
            </p>
            <p className="text-[10px] text-amber-400/80 font-mono">
              Status: <span className="font-bold underline">Awaiting SuperAdmin Activation</span>
            </p>
          </div>
        )}

        {/* Registered Success Banner */}
        {registeredSuccess && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center space-x-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Registration Submitted Successfully</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">{registeredSuccess}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "login" ? (
          <div className="p-6 space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
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

            {/* Quick Demo Switcher with 7 Core Roles */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Demo Switcher (7 Core Roles + Superadmin Support):
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => quickFill("rwemera30@gmail.com")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-purple-500/40 text-left transition-colors"
                >
                  <div className="font-bold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> SuperAdmin
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">rwemera30@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("manager@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">1. Manager</div>
                  <div className="text-[10px] text-slate-400 truncate">manager@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("accountant@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">2. Accountant</div>
                  <div className="text-[10px] text-slate-400 truncate">accountant@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("stock@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">3. Storekeeper</div>
                  <div className="text-[10px] text-slate-400 truncate">stock@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("sales@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">4. Salesperson</div>
                  <div className="text-[10px] text-slate-400 truncate">sales@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("cashier@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">5. Cashier</div>
                  <div className="text-[10px] text-slate-400 truncate">cashier@vectos.rw</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("employee@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-left transition-colors"
                >
                  <div className="font-bold text-slate-200">6. Employee</div>
                  <div className="text-[10px] text-cyan-300 truncate">PR & Relations Officer</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill("support@vectos.rw")}
                  className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-cyan-500/30 text-left transition-colors"
                >
                  <div className="font-bold text-cyan-300">7. Support Staff</div>
                  <div className="text-[10px] text-slate-400 truncate">support@vectos.rw</div>
                </button>

                {/* Test Pending Store Approval */}
                <button
                  type="button"
                  onClick={() => quickFill("thierry@kigalinorthdepot.rw")}
                  className="col-span-2 p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-colors"
                >
                  <div className="font-bold text-amber-300 flex items-center justify-between">
                    <span>Test Unapproved Store Applicant</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-amber-500/20 rounded">
                      Pending Approval
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">thierry@kigalinorthdepot.rw (blocked until approved)</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px] leading-relaxed">
              <strong>SuperAdmin Approval Policy:</strong> Once registered, your application will be routed to the Platform SuperAdmin for TIN verification and activation before you start operating.
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Depot / Store Name</label>
              <input
                type="text"
                placeholder="e.g. Kigali Heavy Materials Depot Ltd"
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
                <label className="font-semibold text-slate-300">Location Address</label>
                <input
                  type="text"
                  placeholder="Gikondo Industrial Zone"
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">RRA TIN Number</label>
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
              <label className="font-semibold text-slate-300">Manager Password</label>
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
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Store for Approval</span>
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
