import {
  User,
  Shop,
  Stock,
  Product,
  Customer,
  Order,
  Payment,
  InventoryMovement,
  DashboardReportData,
  SuperadminStats,
} from "../types";

const BASE_URL = "/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("vectos_token");
  const tenantId = localStorage.getItem("vectos_active_tenant_id");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! Status: ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; shop: Shop | null }> {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(): Promise<{ user: User; shop: Shop | null; activeTenantId: number }> {
    return request("/auth/me");
  },

  async registerTenant(payload: any): Promise<{ token: string; user: User; shop: Shop }> {
    return request("/auth/register-tenant", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Shops & Superadmin
  async getShops(): Promise<Shop[]> {
    return request("/shops");
  },

  async getSuperadminOverview(): Promise<SuperadminStats> {
    return request("/shops/superadmin/overview");
  },

  async getCurrentShop(): Promise<Shop> {
    return request("/shops/current");
  },

  async createShop(payload: Partial<Shop>): Promise<Shop> {
    return request("/shops", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateShop(id: number, payload: Partial<Shop>): Promise<Shop> {
    return request(`/shops/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Stocks / Depots
  async getStocks(): Promise<Stock[]> {
    return request("/stocks");
  },

  async createStock(payload: Partial<Stock>): Promise<Stock> {
    return request("/stocks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Products
  async getProducts(filters?: { category?: string; lowStock?: boolean; search?: string }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.lowStock) params.set("lowStock", "true");
    if (filters?.search) params.set("search", filters.search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`/products${qs}`);
  },

  async getProduct(id: number): Promise<Product> {
    return request(`/products/${id}`);
  },

  async createProduct(payload: Partial<Product>): Promise<Product> {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(id: number, payload: Partial<Product>): Promise<Product> {
    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/customers${qs}`);
  },

  async getCustomer(id: number): Promise<Customer & { orders: Order[] }> {
    return request(`/customers/${id}`);
  },

  async createCustomer(payload: Partial<Customer>): Promise<Customer> {
    return request("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async payCustomerDebt(
    customerId: number,
    payload: {
      amount: number;
      payment_method: "cash" | "momo" | "bank_transfer" | "debt_credit";
      reference_no?: string;
      order_id?: number | null;
    }
  ): Promise<{ message: string; payment: Payment; updatedBalance: number }> {
    return request(`/customers/${customerId}/pay-debt`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Orders
  async getOrders(filters?: { customerId?: number; paymentStatus?: string }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.customerId) params.set("customerId", String(filters.customerId));
    if (filters?.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`/orders${qs}`);
  },

  async getOrder(id: number): Promise<Order & { shop: Shop }> {
    return request(`/orders/${id}`);
  },

  async createOrder(payload: {
    stock_id?: number;
    customer_id?: number;
    notes?: string;
    items: {
      product_id: number;
      quantity: number;
      selling_price?: number;
    }[];
    payment?: {
      amount: number;
      payment_method: "cash" | "momo" | "bank_transfer" | "debt_credit";
      reference_no?: string;
    };
  }): Promise<{ message: string; order: Order; shop: Shop }> {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    return request("/payments");
  },

  // Inventory & Movements
  async getMovements(productId?: number): Promise<InventoryMovement[]> {
    const qs = productId ? `?productId=${productId}` : "";
    return request(`/inventory/movements${qs}`);
  },

  async recordStockIntake(payload: {
    product_id: number;
    quantity: number;
    buying_price?: number;
    selling_price?: number;
    notes?: string;
  }): Promise<{ message: string; product: Product }> {
    return request("/inventory/intake", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async recordStockAdjustment(payload: {
    product_id: number;
    quantity_change: number;
    movement_type: "Adjustment" | "Damage" | "Return";
    notes?: string;
  }): Promise<{ message: string; product: Product }> {
    return request("/inventory/adjustment", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Reports
  async getDashboardReports(): Promise<DashboardReportData> {
    return request("/reports/dashboard");
  },

  // Users
  async getUsers(): Promise<User[]> {
    return request("/users");
  },

  async createUser(payload: any): Promise<User> {
    return request("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateUser(id: number, payload: Partial<User>): Promise<User> {
    return request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
