import React, { useState, useEffect } from "react";
import { Customer } from "../../types";
import { api } from "../../services/api";
import { PaymentRecordModal } from "./PaymentRecordModal";
import { CustomerModal } from "./CustomerModal";
import {
  CreditCard,
  Search,
  UserPlus,
  RefreshCw,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Receipt,
} from "lucide-react";

export const CustomerDebtLedger: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomers(search || undefined);
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  // Aggregate metrics
  const totalOutstanding = customers.reduce(
    (acc, c) => acc + Number(c.credit_balance || 0),
    0
  );
  const debtorCount = customers.filter((c) => Number(c.credit_balance || 0) > 0).length;

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-slate-950">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <CreditCard className="w-6 h-6 text-brand-400" />
            <span>Customer Credit & Debt Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Track receivables, contractor installment schedules, and credit reconciliations
          </p>
        </div>

        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Contractor / Client</span>
        </button>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Outstanding Debt
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {totalOutstanding.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">RWF</span>
          </div>
          <p className="text-[11px] text-slate-400">Unsettled credit from contractor sales</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Debtors
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {debtorCount}{" "}
            <span className="text-xs font-normal text-slate-400">Contractors</span>
          </div>
          <p className="text-[11px] text-slate-400">Clients with unpaid order balances</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Client Accounts
          </span>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {customers.length}
          </div>
          <p className="text-[11px] text-slate-400">Registered contractors in depot ledger</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by contractor name, phone number, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          onClick={loadCustomers}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-850/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Contractor / Client</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">ID / TIN</th>
              <th className="py-3 px-4 text-right">Outstanding Debt</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                  Loading client balances...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No contractors found.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const balance = Number(c.credit_balance || 0);
                const hasDebt = balance > 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {c.email || "No email on record"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {c.phone || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {c.id_number || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {hasDebt ? (
                        <span className="font-bold text-rose-400 text-sm">
                          {balance.toLocaleString()} RWF
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settled (0 RWF)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedCustomerForPayment(c)}
                        disabled={!hasDebt}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          hasDebt
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                            : "bg-slate-800 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Settle Payment
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Settle Debt Modal */}
      {selectedCustomerForPayment && (
        <PaymentRecordModal
          customer={selectedCustomerForPayment}
          onClose={() => setSelectedCustomerForPayment(null)}
          onSuccess={() => {
            setSelectedCustomerForPayment(null);
            loadCustomers();
          }}
        />
      )}

      {/* Add Customer Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          onClose={() => setIsCustomerModalOpen(false)}
          onSuccess={() => {
            setIsCustomerModalOpen(false);
            loadCustomers();
          }}
        />
      )}
    </div>
  );
};
