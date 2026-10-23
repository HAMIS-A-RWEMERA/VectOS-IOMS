import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. shops (Tenants)
export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  owner_name: text("owner_name"),
  phone: text("phone"),
  email: text("email").unique(),
  location: text("location"),
  tin_number: text("tin_number"),
  status: text("status").default("pending_approval"), // 'active' | 'pending_approval' | 'rejected' | 'suspended'
  subscription_plan: text("subscription_plan").default("enterprise"), // 'starter' | 'professional' | 'enterprise'
  receipt_footer: text("receipt_footer"),
  approval_notes: text("approval_notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// 2. stocks (Warehouses / Depots)
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  location: text("location"),
  manager_name: text("manager_name"),
  is_main: integer("is_main").default(0), // 1 = main warehouse, 0 = secondary depot/counter
  status: text("status").default("active"),
});

// 3. users (RBAC Accounts)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id").references(() => shops.id, {
    onDelete: "cascade",
  }), // null for superadmin without assigned shop
  stock_id: integer("stock_id").references(() => stocks.id),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'superadmin' | 'superadmin_support' | 'manager' | 'accountant' | 'storekeeper' | 'salesperson' | 'cashier' | 'employee'
  job_title: text("job_title"),
  phone: text("phone"),
  is_active: integer("is_active").default(1),

  // --- THE 16 CORE CAPABILITIES (The Checklist) ---
  can_create_orders: integer("can_create_orders").default(1),
  can_process_payments: integer("can_process_payments").default(1),
  can_release_stock: integer("can_release_stock").default(0),
  can_manage_stock: integer("can_manage_stock").default(0),
  can_import_export_stock: integer("can_import_export_stock").default(0),
  can_partner_borrow: integer("can_partner_borrow").default(0),
  can_view_reports: integer("can_view_reports").default(0),
  can_view_buying_prices: integer("can_view_buying_prices").default(0),
  can_give_discounts: integer("can_give_discounts").default(0),
  can_manage_users: integer("can_manage_users").default(0),
  can_print_full_receipt: integer("can_print_full_receipt").default(1),
  can_print_delivery_note: integer("can_print_delivery_note").default(1),
  can_manage_customers: integer("can_manage_customers").default(0),
  can_manage_partners: integer("can_manage_partners").default(0),
  can_void_orders: integer("can_void_orders").default(0),
  can_edit_company_settings: integer("can_edit_company_settings").default(0),

  // Supplementary administrative safeguards
  can_view_audit_trail: integer("can_view_audit_trail").default(0),
  can_reset_passwords: integer("can_reset_passwords").default(0),
});

// 4. products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  stock_id: integer("stock_id").references(() => stocks.id),
  name: text("name").notNull(),
  sku: text("sku"),
  barcode: text("barcode"),
  category: text("category"),
  unit: text("unit").default("pcs"), // pcs, bags, rolls, meters, kg, boxes, sheets
  buying_price: numeric("buying_price", { precision: 14, scale: 2 }).notNull(),
  selling_price: numeric("selling_price", { precision: 14, scale: 2 }).notNull(),
  quantity: integer("quantity").default(0),
  low_stock_threshold: integer("low_stock_threshold").default(10),
  description: text("description"),
});

// 5. customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  id_number: text("id_number"),
  email: text("email"),
  credit_balance: numeric("credit_balance", { precision: 14, scale: 2 }).default("0"),
});

// 6. orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  stock_id: integer("stock_id").references(() => stocks.id),
  order_number: text("order_number").unique().notNull(),
  customer_id: integer("customer_id").references(() => customers.id),
  salesperson_id: integer("salesperson_id").references(() => users.id),
  total_amount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  paid_amount: numeric("paid_amount", { precision: 14, scale: 2 }).notNull(),
  debt_amount: numeric("debt_amount", { precision: 14, scale: 2 }).default("0"),
  payment_status: text("payment_status").notNull(), // 'paid' | 'partial' | 'debt'
  fulfillment_status: text("fulfillment_status").default("completed"), // 'pending' | 'completed' | 'cancelled'
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// 7. order_items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  product_id: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  buying_price: numeric("buying_price", { precision: 14, scale: 2 }).notNull(),
  selling_price: numeric("selling_price", { precision: 14, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 14, scale: 2 }).notNull(),
});

// 8. payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  order_id: integer("order_id").references(() => orders.id),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  payment_method: text("payment_method").notNull(), // 'cash' | 'momo' | 'bank_transfer' | 'debt_credit'
  reference_no: text("reference_no"),
  recorded_by: integer("recorded_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// 9. inventory_movements
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  shop_id: integer("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  product_id: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  movement_type: text("movement_type").notNull(), // 'Stock Received' | 'Sale' | 'Adjustment' | 'Damage' | 'Return'
  performed_by: integer("performed_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// 10. session
export const session = pgTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Relations
export const shopsRelations = relations(shops, ({ many }) => ({
  stocks: many(stocks),
  users: many(users),
  products: many(products),
  customers: many(customers),
  orders: many(orders),
  payments: many(payments),
  movements: many(inventoryMovements),
}));

export const stocksRelations = relations(stocks, ({ one, many }) => ({
  shop: one(shops, {
    fields: [stocks.shop_id],
    references: [shops.id],
  }),
  products: many(products),
  orders: many(orders),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  shop: one(shops, {
    fields: [users.shop_id],
    references: [shops.id],
  }),
  stock: one(stocks, {
    fields: [users.stock_id],
    references: [stocks.id],
  }),
  orders: many(orders),
  payments: many(payments),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, {
    fields: [products.shop_id],
    references: [shops.id],
  }),
  stock: one(stocks, {
    fields: [products.stock_id],
    references: [stocks.id],
  }),
  orderItems: many(orderItems),
  movements: many(inventoryMovements),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  shop: one(shops, {
    fields: [customers.shop_id],
    references: [shops.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  shop: one(shops, {
    fields: [orders.shop_id],
    references: [shops.id],
  }),
  stock: one(stocks, {
    fields: [orders.stock_id],
    references: [stocks.id],
  }),
  customer: one(customers, {
    fields: [orders.customer_id],
    references: [customers.id],
  }),
  salesperson: one(users, {
    fields: [orders.salesperson_id],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  shop: one(shops, {
    fields: [payments.shop_id],
    references: [shops.id],
  }),
  order: one(orders, {
    fields: [payments.order_id],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [payments.recorded_by],
    references: [users.id],
  }),
}));

export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    shop: one(shops, {
      fields: [inventoryMovements.shop_id],
      references: [shops.id],
    }),
    product: one(products, {
      fields: [inventoryMovements.product_id],
      references: [products.id],
    }),
    user: one(users, {
      fields: [inventoryMovements.performed_by],
      references: [users.id],
    }),
  })
);
