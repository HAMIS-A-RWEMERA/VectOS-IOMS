export type RoleType =
  | "superadmin"
  | "superadmin_support"
  | "manager"
  | "accountant"
  | "storekeeper"
  | "salesperson"
  | "cashier"
  | "employee";

export interface Shop {
  id: number;
  name: string;
  code: string;
  owner_name?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  tin_number?: string | null;
  status: "active" | "pending_approval" | "rejected" | "suspended" | string;
  subscription_plan?: string | null;
  receipt_footer?: string | null;
  approval_notes?: string | null;
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

export interface UserCapabilities {
  // The 16 Core Capabilities
  can_create_orders: number;
  can_process_payments: number;
  can_release_stock: number;
  can_manage_stock: number;
  can_import_export_stock: number;
  can_partner_borrow: number;
  can_view_reports: number;
  can_view_buying_prices: number;
  can_give_discounts: number;
  can_manage_users: number;
  can_print_full_receipt: number;
  can_print_delivery_note: number;
  can_manage_customers: number;
  can_manage_partners: number;
  can_void_orders: number;
  can_edit_company_settings: number;

  // Supplementary administrative safeguards
  can_view_audit_trail: number;
  can_reset_passwords: number;
}

export interface User extends Partial<UserCapabilities> {
  id: number;
  shop_id: number | null;
  stock_id: number | null;
  name: string;
  email: string;
  role: RoleType;
  job_title?: string | null;
  phone?: string | null;
  is_active?: number | null;
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
  pendingApprovalsCount: number;
  totalNetworkRevenue: number;
  totalNetworkOrders: number;
  pendingShops: Shop[];
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

// 16 Core Capabilities Metadata & Definitions
export interface CapabilityDefinition {
  key: keyof UserCapabilities;
  name: string;
  category: "Sales & Register" | "Depot Logistics" | "Financial Intel" | "CRM & Partners" | "Administrative";
  description: string;
}

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    key: "can_create_orders",
    name: "Create POS Orders",
    category: "Sales & Register",
    description: "Create POS counter orders and negotiate selling prices",
  },
  {
    key: "can_process_payments",
    name: "Process Payments",
    category: "Sales & Register",
    description: "Accept and confirm Cash, Mobile Money (MoMo), and Bank payments",
  },
  {
    key: "can_give_discounts",
    name: "Grant Discounts",
    category: "Sales & Register",
    description: "Grant customer discounts and adjust price floors",
  },
  {
    key: "can_void_orders",
    name: "Void Orders",
    category: "Sales & Register",
    description: "Cancel or void unpaid/pending sales orders",
  },
  {
    key: "can_print_full_receipt",
    name: "Print Full Receipts",
    category: "Sales & Register",
    description: "Print official sales receipts showing monetary values",
  },
  {
    key: "can_print_delivery_note",
    name: "Print Delivery Notes",
    category: "Sales & Register",
    description: "Print warehouse delivery notes / waybills (quantities only, no prices)",
  },
  {
    key: "can_release_stock",
    name: "Release Physical Stock",
    category: "Depot Logistics",
    description: "Authorize physical dispatch and release of goods from depots",
  },
  {
    key: "can_manage_stock",
    name: "Manage & Adjust Stock",
    category: "Depot Logistics",
    description: "Adjust stock levels, damage entries, and inventory movements",
  },
  {
    key: "can_import_export_stock",
    name: "Bulk Import / Export",
    category: "Depot Logistics",
    description: "Bulk Excel / CSV imports and stock exports",
  },
  {
    key: "can_partner_borrow",
    name: "Partner Store Borrowing",
    category: "Depot Logistics",
    description: "Source and borrow stock from peer hardware partner stores",
  },
  {
    key: "can_view_reports",
    name: "View Financial Reports",
    category: "Financial Intel",
    description: "Access financial statements, sales summaries, and profit analytics",
  },
  {
    key: "can_view_buying_prices",
    name: "View Buying Prices (COGS)",
    category: "Financial Intel",
    description: "View purchase costs, supplier rates, and wholesale profit margins",
  },
  {
    key: "can_manage_customers",
    name: "Manage Customers & Debt",
    category: "CRM & Partners",
    description: "Manage contractor profiles, credit accounts, and credit limits",
  },
  {
    key: "can_manage_partners",
    name: "Manage Partner Hardware Shops",
    category: "CRM & Partners",
    description: "Manage partner hardware shops and settlement ledgers",
  },
  {
    key: "can_manage_users",
    name: "Manage Staff & Permissions",
    category: "Administrative",
    description: "Create staff accounts, assign job titles, and toggle permissions",
  },
  {
    key: "can_edit_company_settings",
    name: "Edit Company Settings",
    category: "Administrative",
    description: "Edit store tax numbers (TIN), business info, and receipt footers",
  },
  {
    key: "can_view_audit_trail",
    name: "View Audit Trail",
    category: "Administrative",
    description: "Inspect immutable audit logs of stock movements and staff activities",
  },
  {
    key: "can_reset_passwords",
    name: "Reset Staff Passwords",
    category: "Administrative",
    description: "Authorize password resets for store staff",
  },
];

// Default Role Templates for 7 Core Roles + 8th Superadmin Support Role
export const ROLE_DEFAULT_CAPABILITIES: Record<RoleType, UserCapabilities> = {
  superadmin: {
    can_create_orders: 1,
    can_process_payments: 1,
    can_release_stock: 1,
    can_manage_stock: 1,
    can_import_export_stock: 1,
    can_partner_borrow: 1,
    can_view_reports: 1,
    can_view_buying_prices: 1,
    can_give_discounts: 1,
    can_manage_users: 1,
    can_print_full_receipt: 1,
    can_print_delivery_note: 1,
    can_manage_customers: 1,
    can_manage_partners: 1,
    can_void_orders: 1,
    can_edit_company_settings: 1,
    can_view_audit_trail: 1,
    can_reset_passwords: 1,
  },
  superadmin_support: {
    can_create_orders: 0,
    can_process_payments: 0,
    can_release_stock: 0,
    can_manage_stock: 0,
    can_import_export_stock: 1,
    can_partner_borrow: 0,
    can_view_reports: 1,
    can_view_buying_prices: 0,
    can_give_discounts: 0,
    can_manage_users: 0,
    can_print_full_receipt: 1,
    can_print_delivery_note: 1,
    can_manage_customers: 1,
    can_manage_partners: 1,
    can_void_orders: 0,
    can_edit_company_settings: 0,
    can_view_audit_trail: 1,
    can_reset_passwords: 1,
  },
  manager: {
    can_create_orders: 1,
    can_process_payments: 1,
    can_release_stock: 1,
    can_manage_stock: 1,
    can_import_export_stock: 1,
    can_partner_borrow: 1,
    can_view_reports: 1,
    can_view_buying_prices: 1,
    can_give_discounts: 1,
    can_manage_users: 1,
    can_print_full_receipt: 1,
    can_print_delivery_note: 1,
    can_manage_customers: 1,
    can_manage_partners: 1,
    can_void_orders: 1,
    can_edit_company_settings: 1,
    can_view_audit_trail: 1,
    can_reset_passwords: 1,
  },
  accountant: {
    can_create_orders: 0,
    can_process_payments: 1,
    can_release_stock: 0,
    can_manage_stock: 0,
    can_import_export_stock: 1,
    can_partner_borrow: 0,
    can_view_reports: 1,
    can_view_buying_prices: 1,
    can_give_discounts: 0,
    can_manage_users: 0,
    can_print_full_receipt: 1,
    can_print_delivery_note: 0,
    can_manage_customers: 1,
    can_manage_partners: 1,
    can_void_orders: 0,
    can_edit_company_settings: 0,
    can_view_audit_trail: 1,
    can_reset_passwords: 0,
  },
  storekeeper: {
    can_create_orders: 0,
    can_process_payments: 0,
    can_release_stock: 1,
    can_manage_stock: 1,
    can_import_export_stock: 1,
    can_partner_borrow: 1,
    can_view_reports: 0,
    can_view_buying_prices: 0,
    can_give_discounts: 0,
    can_manage_users: 0,
    can_print_full_receipt: 0,
    can_print_delivery_note: 1,
    can_manage_customers: 0,
    can_manage_partners: 1,
    can_void_orders: 0,
    can_edit_company_settings: 0,
    can_view_audit_trail: 1,
    can_reset_passwords: 0,
  },
  salesperson: {
    can_create_orders: 1,
    can_process_payments: 0,
    can_release_stock: 0,
    can_manage_stock: 0,
    can_import_export_stock: 0,
    can_partner_borrow: 1,
    can_view_reports: 0,
    can_view_buying_prices: 0,
    can_give_discounts: 1,
    can_manage_users: 0,
    can_print_full_receipt: 1,
    can_print_delivery_note: 1,
    can_manage_customers: 1,
    can_manage_partners: 0,
    can_void_orders: 0,
    can_edit_company_settings: 0,
    can_view_audit_trail: 0,
    can_reset_passwords: 0,
  },
  cashier: {
    can_create_orders: 1,
    can_process_payments: 1,
    can_release_stock: 0,
    can_manage_stock: 0,
    can_import_export_stock: 0,
    can_partner_borrow: 0,
    can_view_reports: 0,
    can_view_buying_prices: 0,
    can_give_discounts: 0,
    can_manage_users: 0,
    can_print_full_receipt: 1,
    can_print_delivery_note: 0,
    can_manage_customers: 0,
    can_manage_partners: 0,
    can_void_orders: 0,
    can_edit_company_settings: 0,
    can_view_audit_trail: 0,
    can_reset_passwords: 0,
  },
  employee: {
    can_create_orders: 0,
    can_process_payments: 0,
    can_release_stock: 0,
    can_manage_stock: 0,
    can_import_export_stock: 0,
    can_partner_borrow: 0,
    can_view_reports: 0,
    can_view_buying_prices: 0,
    can_give_discounts: 0,
    can_manage_users: 0,
    can_print_full_receipt: 0,
    can_print_delivery_note: 1,
    can_manage_customers: 1,
    can_manage_partners: 0,
    can_void_orders: 0,
    can_edit_company_settings: 0,
    can_view_audit_trail: 0,
    can_reset_passwords: 0,
  },
};
