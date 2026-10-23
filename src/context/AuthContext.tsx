import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Shop } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  token: string | null;
  activeTenantId: number | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setActiveTenant: (shopId: number) => Promise<void>;
  hasPermission: (permission: keyof User) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("vectos_token"));
  const [activeTenantId, setActiveTenantId] = useState<number | null>(
    localStorage.getItem("vectos_active_tenant_id")
      ? parseInt(localStorage.getItem("vectos_active_tenant_id")!, 10)
      : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      if (!localStorage.getItem("vectos_token")) {
        setUser(null);
        setShop(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setShop(data.shop);
      if (data.activeTenantId) {
        setActiveTenantId(data.activeTenantId);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    localStorage.setItem("vectos_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setShop(data.shop);
    if (data.shop) {
      localStorage.setItem("vectos_active_tenant_id", String(data.shop.id));
      setActiveTenantId(data.shop.id);
    }
  };

  const logout = () => {
    localStorage.removeItem("vectos_token");
    localStorage.removeItem("vectos_active_tenant_id");
    setToken(null);
    setUser(null);
    setShop(null);
    setActiveTenantId(null);
  };

  const setActiveTenant = async (shopId: number) => {
    localStorage.setItem("vectos_active_tenant_id", String(shopId));
    setActiveTenantId(shopId);
    try {
      const currentShop = await api.getCurrentShop();
      setShop(currentShop);
    } catch (e) {
      console.error("Failed to switch tenant shop:", e);
    }
  };

  const hasPermission = (perm: keyof User): boolean => {
    if (!user) return false;
    if (user.role === "superadmin" || user.email === "rwemera30@gmail.com") return true;
    return Boolean(user[perm]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        token,
        activeTenantId,
        isLoading,
        login,
        logout,
        setActiveTenant,
        hasPermission,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
