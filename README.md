# VECTOS ERP — Production Multi-Tenant Hardware & Retail Depot Management System

VECTOS is a full-stack B2B Multi-Tenant Retail & Inventory Management System (IOMS/ERP) engineered specifically for hardware stores, construction material yards, and electronics depots.

---

## 🚀 Tech Stack

- **Frontend**: React 19 (TypeScript) + Vite + Tailwind CSS + Lucide React
- **Backend**: Node.js / Express (TypeScript) packaged for Vercel Serverless Functions (`api/index.js`)
- **Database**: Neon Serverless Postgres using Drizzle ORM and `@neondatabase/serverless` with WebSocket connection pooling
- **Authentication**: Pure PostgreSQL Session/JWT Auth with bcrypt password hashing (No Firebase, No Supabase Auth, No external vendors)
- **Deployment Target**: Vercel Serverless + GitHub

---

## 🌟 Key Application Features

1. **Multi-Tenancy & Global Superadmin**:
   - Platform Owner (`rwemera30@gmail.com`) has universal Superadmin privileges.
   - Can switch context between tenant stores with a single click in the top navigation bar.
   - Cross-store network revenue metrics, store accounts provisioning, and subscription tier management.
   - Strict tenant isolation: Store A can never access Store B's products, sales, customers, or reports (`WHERE shop_id = current_user.shop_id`).

2. **Point of Sale (POS) Register**:
   - Rapid product search and category filtering pills (Cement, Roofing, Steel & Rebar, Plumbing, Paints, Electrical, Tools, Gypsum Boards).
   - Barcode scanner input with auto-add on barcode reading.
   - Cart management with line-item quantity steppers, unit price overrides, and custom discounts.
   - Multi-channel payments:
     - **Cash** (with change calculator)
     - **MTN Mobile Money / Airtel Money** (with transaction reference tracking)
     - **Bank Transfer** (with deposit slip reference)
     - **Customer Debt / Credit Ledger** (debits balance to contractor account)
   - Generates and prints professional **80mm thermal receipts** and **80mm goods delivery notes** (`@media print` optimized).

3. **Inventory & Warehouse Tracking**:
   - Stock receiving (intake) modal with supplier invoice reference and unit cost updates.
   - Real-time gross margin calculation (`((Selling - Buying) / Selling) * 100`).
   - Stock adjustment modal for damage, loss, or customer returns.
   - Low stock warning badges with customizable thresholds.
   - Multi-depot support (Main Yard Warehouse vs. Retail Counter Depot).
   - Comprehensive inventory movement audit log.

4. **Customer Credit & Debt Ledger**:
   - Track outstanding debt per contractor or client.
   - Record partial or full installment payments towards debt.
   - Settle credit balances with real-time balance calculations.

5. **Financial Reports & Cash Reconciliation**:
   - Daily register cash reconciliation broken down by Drawer Cash, MoMo, Bank, and Credit.
   - Gross revenue vs. Cost of Goods Sold (COGS) vs. Gross Profit and Margin %.
   - Top-performing products ranked by sales volume and revenue.
   - Critical low stock alerts.

6. **Staff Management & Granular RBAC**:
   - Roles: `superadmin`, `manager`, `cashier`, `stock_keeper`, `accountant`.
   - Granular permission flags:
     - `can_create_orders`
     - `can_process_payments`
     - `can_release_stock`
     - `can_manage_stock`
     - `can_view_reports`
     - `can_give_discounts`
     - `can_manage_users`
     - `can_void_orders`

---

## 🔑 Pre-Seeded User Accounts

| Role | Email | Password | Permissions Summary |
|---|---|---|---|
| **Superadmin (Owner)** | `rwemera30@gmail.com` | `Password123!` | Full cross-store access, tenant switching, global analytics |
| **Depot Manager** | `manager@vectos.rw` | `Password123!` | All store operations, stock management, reports, discounts |
| **Head Cashier** | `cashier@vectos.rw` | `Password123!` | POS checkout, customer payments, cash receipts |
| **Stock Keeper** | `stock@vectos.rw` | `Password123!` | Stock intake, damage write-offs, warehouse transfers |
| **Accountant** | `accountant@vectos.rw` | `Password123!` | Daily cash reconciliation, reports, contractor credit ledger |

---

## 🗄️ Relational Database Schema (Drizzle ORM)

- `shops`: `id`, `name`, `code`, `owner_name`, `phone`, `email`, `location`, `tin_number`, `status`, `subscription_plan`, `created_at`
- `stocks`: `id`, `shop_id`, `name`, `code`, `location`, `manager_name`, `is_main`, `status`
- `users`: `id`, `shop_id`, `stock_id`, `name`, `email`, `password`, `role`, `job_title`, `phone`, `is_active`, granular permissions
- `products`: `id`, `shop_id`, `stock_id`, `name`, `sku`, `barcode`, `category`, `unit`, `buying_price`, `selling_price`, `quantity`, `low_stock_threshold`, `description`
- `customers`: `id`, `shop_id`, `name`, `phone`, `id_number`, `email`, `credit_balance`
- `orders`: `id`, `shop_id`, `stock_id`, `order_number`, `customer_id`, `salesperson_id`, `total_amount`, `paid_amount`, `debt_amount`, `payment_status`, `fulfillment_status`, `notes`, `created_at`
- `order_items`: `id`, `order_id`, `product_id`, `quantity`, `buying_price`, `selling_price`, `subtotal`, `profit`
- `payments`: `id`, `shop_id`, `order_id`, `amount`, `payment_method`, `reference_no`, `recorded_by`, `created_at`
- `inventory_movements`: `id`, `shop_id`, `product_id`, `quantity`, `movement_type`, `performed_by`, `created_at`
- `session`: `sid`, `sess`, `expire`

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:<password>@<ep-id>.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=vectos_jwt_secret_key_prod_89274291741294
NODE_ENV=production
```

> **Note**: Even if `DATABASE_URL` is empty during initial review or offline testing, the system provides an in-memory/fallback database that functions with identical relational semantics and preloaded Rwandan hardware depot data!

---

## 🛠️ Local Development & Scripts

```bash
# 1. Install dependencies
npm install

# 2. Run both Vite client and Express server concurrently
npm run dev

# 3. Push schema to Neon PostgreSQL
npm run db:push

# 4. Seed database with initial users and Rwandan hardware catalog
npm run db:seed

# 5. Build for production (Client + Vercel Serverless Function)
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Configure Environment Variables in Vercel:
   - `DATABASE_URL`: Your Neon Postgres connection string.
   - `JWT_SECRET`: A secure string for signing tokens.
4. Deployment settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Vercel automatically deploys the frontend as static assets and the Express backend as a serverless function at `/api/index.js` matching `vercel.json`.
