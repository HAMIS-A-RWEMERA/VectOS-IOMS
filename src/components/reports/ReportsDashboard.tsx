import React, { useState, useEffect } from "react";
import { DashboardReportData } from "../../types";
import { api } from "../../services/api";
import {
  BarChart3,
  TrendingUp,
  Banknote,
  Smartphone,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Package,
  DollarSign,
  PieChart,
} from "lucide-react";

export const ReportsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDashboardReports();
      setData(res);
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Generating financial analytics & cash reconciliation...
      </div>
    );
  }

  const { overview, reconciliation, topProducts, lowStockAlerts } = data;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            <span>Financial Reports & Cash Reconciliation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-channel cash register tally, profit margins, and sales volume
          </p>
        </div>
        <button
          onClick={loadReports}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {overview.totalRevenue.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">RWF</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {overview.totalOrdersCount} completed POS transactions
          </p>
        </div>

        {/* Collected Cash/MoMo */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Received</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {overview.totalCollected.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">RWF</span>
          </div>
          <p className="text-[11px] text-slate-400">Cash, Mobile Money, and Bank Wires</p>
        </div>

        {/* Gross Profit & Margin */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Profit</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
              {overview.profitMarginPct}% margin
            </span>
          </div>
          <div className="text-2xl font-black text-brand-300 font-mono">
            {overview.totalGrossProfit.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">RWF</span>
          </div>
          <p className="text-[11px] text-slate-400">Net after deducting product buying costs (COGS)</p>
        </div>

        {/* Outstanding Receivables / Debt */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Receivables</span>
            <FileSpreadsheet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {overview.totalOutstandingDebt.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">RWF</span>
          </div>
          <p className="text-[11px] text-slate-400">Contractor credit waiting for settlement</p>
        </div>
      </div>

      {/* Daily Cash Reconciliation Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Daily Register Cash Reconciliation & Channel Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400">
            End-of-day register balancing by drawer cash, MTN MoMo, bank deposits, and credit
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          {/* Drawer Cash */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Physical Cash</span>
                <div className="font-mono font-bold text-white text-sm">
                  {reconciliation.cash.toLocaleString()} RWF
                </div>
              </div>
            </div>
          </div>

          {/* MoMo */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">MTN / Airtel MoMo</span>
                <div className="font-mono font-bold text-white text-sm">
                  {reconciliation.momo.toLocaleString()} RWF
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Bank Transfers</span>
                <div className="font-mono font-bold text-white text-sm">
                  {reconciliation.bank_transfer.toLocaleString()} RWF
                </div>
              </div>
            </div>
          </div>

          {/* Debt / Credit */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Customer Credit</span>
                <div className="font-mono font-bold text-white text-sm">
                  {reconciliation.debt_credit.toLocaleString()} RWF
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>Top-Performing Depot Products</span>
            </h3>
            <p className="text-xs text-slate-400">Ranked by gross sales volume and revenue</p>
          </div>

          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No sales registered yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.quantity} units sold
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-brand-300">
                    {p.revenue.toLocaleString()} RWF
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Critical Low Stock Alerts</span>
              </h3>
              <p className="text-xs text-slate-400">Depot items needing immediate replenishment</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {lowStockAlerts.length} Critical
            </span>
          </div>

          <div className="space-y-2">
            {lowStockAlerts.length === 0 ? (
              <p className="text-xs text-emerald-400 py-4 text-center">
                All inventory levels are currently above re-order thresholds.
              </p>
            ) : (
              lowStockAlerts.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-850 border border-amber-500/20 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Threshold: {item.low_stock_threshold} {item.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-400">
                      {item.quantity} {item.unit} remaining
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
