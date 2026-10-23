import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar, NavTab } from "./components/layout/Sidebar";
import { PosRegister } from "./components/pos/PosRegister";
import { ProductList } from "./components/inventory/ProductList";
import { CustomerDebtLedger } from "./components/debt/CustomerDebtLedger";
import { ReportsDashboard } from "./components/reports/ReportsDashboard";
import { UserManagement } from "./components/users/UserManagement";
import { SuperadminDashboard } from "./components/superadmin/SuperadminDashboard";
import { LoginScreen } from "./components/auth/LoginScreen";
import { api } from "./services/api";

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("pos");
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      api
        .getProducts({ lowStock: true })
        .then((prods) => setLowStockCount(prods.length))
        .catch(() => {});
    }
  }, [user, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-lg animate-pulse">
            V
          </div>
          <span className="font-medium">Connecting to Vectos Cloud ERP...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lowStockCount={lowStockCount}
        />
        <main className="flex-1 overflow-hidden relative">
          {activeTab === "pos" && <PosRegister />}
          {activeTab === "inventory" && <ProductList />}
          {activeTab === "debt" && <CustomerDebtLedger />}
          {activeTab === "reports" && <ReportsDashboard />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "superadmin" && <SuperadminDashboard />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
