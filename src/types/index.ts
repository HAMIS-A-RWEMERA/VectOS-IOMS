export interface Shop {
  id: number;
  name: string;
  code: string;
  owner_name?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  tin_number?: string | null;
  status?: string | null;
  subscription_plan?: string | null;
  created_at?: string;
}

export interface Stock {
  id: number;
  shop_id: number;
  name: string;
  code: string;
  location?: string | null;
  manager_name?: string | null;
  is_main?: number | null;
  status?: string | null;
}

export interface User {
  id: number;
  shop_id: number | null;
  stock_id: number | null;
  name: string;
  email: string;
  role: "superadmin" | "manager" | "cashier" | "stock_keeper" | "accountant";
  job_title?: string | null;
  phone?: string | null;
  is_active?: number | null;
  can_create_orders?: number | null;
  can_process_payments?: number | null;
  can_release_stock?: number | null;
  can_manage_stock?: number | null;
  can_view_reports?: number | null;
  can_give_discounts?: number | null;
  can_manage_users?: number | null;
  can_void_orders?: number | null;
}

export interface Product {
  id: number;
  shop_id: number;
  stock_id?: number | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  unit?: string | null;
  buying_price: number | string;
  selling_price: number | string;
  quantity: number;
  low_stock_threshold: number;
  description?: string | null;
}

export interface Customer {
  id: number;
  shop_id: number;
  name: string;
  phone?: string | null;
  id_number?: string | null;
  email?: string | null;
  credit_balance: number | string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  buying_price: number | string;
  selling_price: number | string;
  subtotal: number | string;
  profit: number | string;
  product_name?: string;
}

export interface Order {
  id: number;
  shop_id: number;
  stock_id?: number | null;
  order_number: string;
  customer_id?: number | null;
  salesperson_id?: number | null;
  total_amount: number | string;
  paid_amount: number | string;
  debt_amount: number | string;
  payment_status: "paid" | "partial" | "debt";
  fulfillment_status?: "pending" | "completed" | "cancelled" | null;
  notes?: string | null;
  created_at?: string;
  items?: OrderItem[];
  customer?: Customer | null;
  salesperson?: { id: number; name: string } | null;
}

export interface Payment {
  id: number;
  shop_id: number;
  order_id?: number | null;
  amount: number | string;
  payment_method: "cash" | "momo" | "bank_transfer" | "debt_credit";
  reference_no?: string | null;
  recorded_by?: number | null;
  created_at?: string;
  recorded_by_name?: string;
  order_number?: string;
}

export interface InventoryMovement {
  id: number;
  shop_id: number;
  product_id: number;
  quantity: number;
  movement_type: "Stock Received" | "Sale" | "Adjustment" | "Damage" | "Return";
  performed_by?: number | null;
  created_at?: string;
  product_name?: string;
  performed_by_name?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
}

export interface DashboardReportData {
  overview: {
    totalRevenue: number;
    totalCollected: number;
    totalOutstandingDebt: number;
    totalGrossProfit: number;
    profitMarginPct: string;
    totalOrdersCount: number;
    totalProductsCount: number;
    totalCustomersCount: number;
    lowStockItemsCount: number;
  };
  reconciliation: {
    cash: number;
    momo: number;
    bank_transfer: number;
    debt_credit: number;
  };
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStockAlerts: Product[];
}

export interface SuperadminStats {
  totalShops: number;
  totalNetworkRevenue: number;
  totalNetworkOrders: number;
  storeBreakdown: {
    id: number;
    name: string;
    code: string;
    location: string | null;
    status: string | null;
    plan: string | null;
    revenue: number;
    ordersCount: number;
    productsCount: number;
  }[];
}
