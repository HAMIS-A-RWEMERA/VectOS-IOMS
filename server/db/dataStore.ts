import bcrypt from "bcryptjs";
import { db, isConnectedToNeon } from "./index";
import {
  shops,
  stocks,
  users,
  products,
  customers,
  orders,
  orderItems,
  payments,
  inventoryMovements,
} from "./schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface ShopRecord {
  id: number;
  name: string;
  code: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  tin_number: string | null;
  status: string | null;
  subscription_plan: string | null;
  created_at?: Date | string | null;
}

export interface StockRecord {
  id: number;
  shop_id: number;
  name: string;
  code: string;
  location: string | null;
  manager_name: string | null;
  is_main: number | null;
  status: string | null;
}

export interface UserRecord {
  id: number;
  shop_id: number | null;
  stock_id: number | null;
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "manager" | "cashier" | "stock_keeper" | "accountant";
  job_title: string | null;
  phone: string | null;
  is_active: number | null;
  can_create_orders: number | null;
  can_process_payments: number | null;
  can_release_stock: number | null;
  can_manage_stock: number | null;
  can_view_reports: number | null;
  can_give_discounts: number | null;
  can_manage_users: number | null;
  can_void_orders: number | null;
}

export interface ProductRecord {
  id: number;
  shop_id: number;
  stock_id: number | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  unit: string | null;
  buying_price: string | number;
  selling_price: string | number;
  quantity: number | null;
  low_stock_threshold: number | null;
  description: string | null;
}

export interface CustomerRecord {
  id: number;
  shop_id: number;
  name: string;
  phone: string | null;
  id_number: string | null;
  email: string | null;
  credit_balance: string | number | null;
}

export interface OrderItemRecord {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  buying_price: string | number;
  selling_price: string | number;
  subtotal: string | number;
  profit: string | number;
  product_name?: string;
}

export interface OrderRecord {
  id: number;
  shop_id: number;
  stock_id: number | null;
  order_number: string;
  customer_id: number | null;
  salesperson_id: number | null;
  total_amount: string | number;
  paid_amount: string | number;
  debt_amount: string | number | null;
  payment_status: "paid" | "partial" | "debt";
  fulfillment_status: "pending" | "completed" | "cancelled" | null;
  notes: string | null;
  created_at: Date | string | null;
  items?: OrderItemRecord[];
  customer?: CustomerRecord | null;
  salesperson?: { id: number; name: string } | null;
}

export interface PaymentRecord {
  id: number;
  shop_id: number;
  order_id: number | null;
  amount: string | number;
  payment_method: "cash" | "momo" | "bank_transfer" | "debt_credit";
  reference_no: string | null;
  recorded_by: number | null;
  created_at: Date | string | null;
  recorded_by_name?: string;
  order_number?: string;
}

export interface InventoryMovementRecord {
  id: number;
  shop_id: number;
  product_id: number;
  quantity: number;
  movement_type: "Stock Received" | "Sale" | "Adjustment" | "Damage" | "Return";
  performed_by: number | null;
  created_at: Date | string | null;
  product_name?: string;
  performed_by_name?: string;
}

// Memory Store for fallback / zero-config instant evaluation
const defaultHash = bcrypt.hashSync("Password123!", 10);

class MemoryStore {
  shops: ShopRecord[] = [
    {
      id: 1,
      name: "Vectos Hardware & Building Materials Ltd",
      code: "VECTOS-KGL-01",
      owner_name: "Patrick Rwemera",
      phone: "+250 788 123 456",
      email: "rwemera30@gmail.com",
      location: "Kigali, Gikondo Industrial Zone",
      tin_number: "100234567",
      status: "active",
      subscription_plan: "enterprise",
      created_at: new Date("2026-01-15T08:00:00Z"),
    },
    {
      id: 2,
      name: "Nyarugenge Electrical & Hardware Depot",
      code: "NYARU-ELEC-02",
      owner_name: "Aline Uwase",
      phone: "+250 788 654 321",
      email: "aline@nyarugenge-elec.rw",
      location: "Kigali, Nyarugenge Commercial Street",
      tin_number: "100987654",
      status: "active",
      subscription_plan: "professional",
      created_at: new Date("2026-02-01T09:30:00Z"),
    },
    {
      id: 3,
      name: "Musanze Construction Depot",
      code: "MUSANZE-DEPOT-03",
      owner_name: "Jean Claude Nzeyimana",
      phone: "+250 783 555 777",
      email: "jc@musanzedepot.rw",
      location: "Musanze City Center, Northern Province",
      tin_number: "100456123",
      status: "active",
      subscription_plan: "starter",
      created_at: new Date("2026-02-20T10:00:00Z"),
    },
  ];

  stocks: StockRecord[] = [
    {
      id: 1,
      shop_id: 1,
      name: "Main Warehouse - Gikondo Heavy Yard",
      code: "WH-GIK-01",
      location: "Gikondo Heavy Yard, Kigali",
      manager_name: "Eric Mugisha",
      is_main: 1,
      status: "active",
    },
    {
      id: 2,
      shop_id: 1,
      name: "Nyabugogo Retail Counter Depot",
      code: "STK-NYA-02",
      location: "Nyabugogo Commercial Center",
      manager_name: "Diane Mukamana",
      is_main: 0,
      status: "active",
    },
    {
      id: 3,
      shop_id: 2,
      name: "Central Electronics Depot",
      code: "WH-ELEC-01",
      location: "Nyarugenge Commercial Street",
      manager_name: "Kevin Habimana",
      is_main: 1,
      status: "active",
    },
    {
      id: 4,
      shop_id: 3,
      name: "Musanze Central Depot",
      code: "WH-MSZ-01",
      location: "Musanze Industrial Park",
      manager_name: "Jean Claude Nzeyimana",
      is_main: 1,
      status: "active",
    },
  ];

  users: UserRecord[] = [
    {
      id: 1,
      shop_id: 1,
      stock_id: 1,
      name: "Patrick Rwemera (Platform Owner)",
      email: "rwemera30@gmail.com",
      password: defaultHash,
      role: "superadmin",
      job_title: "Platform Owner & Managing Director",
      phone: "+250 788 123 456",
      is_active: 1,
      can_create_orders: 1,
      can_process_payments: 1,
      can_release_stock: 1,
      can_manage_stock: 1,
      can_view_reports: 1,
      can_give_discounts: 1,
      can_manage_users: 1,
      can_void_orders: 1,
    },
    {
      id: 2,
      shop_id: 1,
      stock_id: 1,
      name: "Eric Mugisha",
      email: "manager@vectos.rw",
      password: defaultHash,
      role: "manager",
      job_title: "General Depot Manager",
      phone: "+250 788 222 333",
      is_active: 1,
      can_create_orders: 1,
      can_process_payments: 1,
      can_release_stock: 1,
      can_manage_stock: 1,
      can_view_reports: 1,
      can_give_discounts: 1,
      can_manage_users: 1,
      can_void_orders: 1,
    },
    {
      id: 3,
      shop_id: 1,
      stock_id: 2,
      name: "Diane Mukamana",
      email: "cashier@vectos.rw",
      password: defaultHash,
      role: "cashier",
      job_title: "Head POS Cashier",
      phone: "+250 788 333 444",
      is_active: 1,
      can_create_orders: 1,
      can_process_payments: 1,
      can_release_stock: 0,
      can_manage_stock: 0,
      can_view_reports: 1,
      can_give_discounts: 0,
      can_manage_users: 0,
      can_void_orders: 0,
    },
    {
      id: 4,
      shop_id: 1,
      stock_id: 1,
      name: "Bosco Gasana",
      email: "stock@vectos.rw",
      password: defaultHash,
      role: "stock_keeper",
      job_title: "Warehouse Inventory Controller",
      phone: "+250 788 444 555",
      is_active: 1,
      can_create_orders: 0,
      can_process_payments: 0,
      can_release_stock: 1,
      can_manage_stock: 1,
      can_view_reports: 1,
      can_give_discounts: 0,
      can_manage_users: 0,
      can_void_orders: 0,
    },
    {
      id: 5,
      shop_id: 1,
      stock_id: 1,
      name: "Claudine Mutoni",
      email: "accountant@vectos.rw",
      password: defaultHash,
      role: "accountant",
      job_title: "Senior Financial Accountant",
      phone: "+250 788 555 666",
      is_active: 1,
      can_create_orders: 0,
      can_process_payments: 1,
      can_release_stock: 0,
      can_manage_stock: 0,
      can_view_reports: 1,
      can_give_discounts: 0,
      can_manage_users: 0,
      can_void_orders: 0,
    },
  ];

  products: ProductRecord[] = [
    {
      id: 1,
      shop_id: 1,
      stock_id: 1,
      name: "Cimerwa Cement 32.5R (50kg Bag)",
      sku: "CEM-325-50",
      barcode: "600123456001",
      category: "Cement & Aggregates",
      unit: "bags",
      buying_price: 10500,
      selling_price: 12500,
      quantity: 450,
      low_stock_threshold: 50,
      description: "Standard Portland composite cement for general construction",
    },
    {
      id: 2,
      shop_id: 1,
      stock_id: 1,
      name: "Prime Cement 42.5N High Strength (50kg)",
      sku: "CEM-425-50",
      barcode: "600123456002",
      category: "Cement & Aggregates",
      unit: "bags",
      buying_price: 12000,
      selling_price: 14200,
      quantity: 280,
      low_stock_threshold: 40,
      description: "High early strength cement for multistory slabs and precast",
    },
    {
      id: 3,
      shop_id: 1,
      stock_id: 1,
      name: "Corrugated Iron Sheets Gauge 28 (3m Red)",
      sku: "IS-G28-3M",
      barcode: "600123456003",
      category: "Roofing",
      unit: "sheets",
      buying_price: 11500,
      selling_price: 13800,
      quantity: 320,
      low_stock_threshold: 30,
      description: "Pre-painted galvanized roofing sheets (Crimson Red)",
    },
    {
      id: 4,
      shop_id: 1,
      stock_id: 1,
      name: "Deformed Rebar Steel Rod 12mm (12m Length)",
      sku: "ST-RB12-12M",
      barcode: "600123456004",
      category: "Steel & Metals",
      unit: "pcs",
      buying_price: 14500,
      selling_price: 17200,
      quantity: 190,
      low_stock_threshold: 25,
      description: "High tensile hot-rolled deformed bars grade 500",
    },
    {
      id: 5,
      shop_id: 1,
      stock_id: 1,
      name: "Deformed Rebar Steel Rod 16mm (12m Length)",
      sku: "ST-RB16-12M",
      barcode: "600123456005",
      category: "Steel & Metals",
      unit: "pcs",
      buying_price: 26000,
      selling_price: 30500,
      quantity: 12, // LOW STOCK TRIGGER
      low_stock_threshold: 20,
      description: "Heavy structural foundation rebar steel",
    },
    {
      id: 6,
      shop_id: 1,
      stock_id: 1,
      name: "PVC Drainage Pipe 110mm (4-meter)",
      sku: "PVC-110-4M",
      barcode: "600123456006",
      category: "Plumbing",
      unit: "pcs",
      buying_price: 18000,
      selling_price: 22500,
      quantity: 85,
      low_stock_threshold: 15,
      description: "Rigid unplasticized PVC soil and waste pipe",
    },
    {
      id: 7,
      shop_id: 1,
      stock_id: 1,
      name: "Crown Paint Brilliant White Vinyl Matt 20L",
      sku: "PNT-VM20L-WHT",
      barcode: "600123456007",
      category: "Paints & Finishes",
      unit: "buckets",
      buying_price: 68000,
      selling_price: 79500,
      quantity: 42,
      low_stock_threshold: 10,
      description: "Premium emulsion paint for interior walls and ceilings",
    },
    {
      id: 8,
      shop_id: 1,
      stock_id: 1,
      name: "Heavy Duty LED Floodlight 100W IP66",
      sku: "ELEC-FL100W",
      barcode: "600123456008",
      category: "Electrical",
      unit: "pcs",
      buying_price: 22000,
      selling_price: 29000,
      quantity: 64,
      low_stock_threshold: 12,
      description: "Commercial weatherproof outdoor illumination",
    },
    {
      id: 9,
      shop_id: 1,
      stock_id: 1,
      name: "Single Core Copper Wire 2.5mm (100m Roll)",
      sku: "ELEC-WR25-100",
      barcode: "600123456009",
      category: "Electrical",
      unit: "rolls",
      buying_price: 42000,
      selling_price: 51000,
      quantity: 6, // LOW STOCK TRIGGER
      low_stock_threshold: 15,
      description: "Pure copper electrical installation cable",
    },
    {
      id: 10,
      shop_id: 1,
      stock_id: 1,
      name: "Solid Brass Lever Door Handle Set",
      sku: "HRD-DH-BRS",
      barcode: "600123456010",
      category: "Hardware & Tools",
      unit: "sets",
      buying_price: 14000,
      selling_price: 18500,
      quantity: 55,
      low_stock_threshold: 10,
      description: "Interior door mortise lock set with satin brass finish",
    },
    {
      id: 11,
      shop_id: 1,
      stock_id: 1,
      name: "Total Tools Angle Grinder 900W 115mm",
      sku: "TLS-AG-900W",
      barcode: "600123456011",
      category: "Hardware & Tools",
      unit: "pcs",
      buying_price: 38000,
      selling_price: 47000,
      quantity: 24,
      low_stock_threshold: 5,
      description: "Industrial power cutter and grinding tool",
    },
    {
      id: 12,
      shop_id: 1,
      stock_id: 1,
      name: "Gypsum Board 9.5mm x 1.2m x 2.4m",
      sku: "GYP-95-1224",
      barcode: "600123456012",
      category: "Finishing & Boards",
      unit: "sheets",
      buying_price: 9500,
      selling_price: 12000,
      quantity: 150,
      low_stock_threshold: 20,
      description: "Fire-resistant drywall partition plasterboard",
    },
  ];

  customers: CustomerRecord[] = [
    {
      id: 1,
      shop_id: 1,
      name: "Horizon Construction Ltd",
      phone: "+250 788 333 111",
      id_number: "1198580029384",
      email: "procurement@horizon.rw",
      credit_balance: 450000,
    },
    {
      id: 2,
      shop_id: 1,
      name: "Kigali Villa Developers",
      phone: "+250 788 444 222",
      id_number: "1198080039281",
      email: "info@kigalivillas.rw",
      credit_balance: 185000,
    },
    {
      id: 3,
      shop_id: 1,
      name: "Eng. Emmanuel Bizimana",
      phone: "+250 788 555 333",
      id_number: "1199280018274",
      email: "bizimana.eng@gmail.com",
      credit_balance: 0,
    },
    {
      id: 4,
      shop_id: 1,
      name: "Prime Contractors Rwanda",
      phone: "+250 788 777 888",
      id_number: "1197980048291",
      email: "prime@contractors.rw",
      credit_balance: 920000,
    },
    {
      id: 5,
      shop_id: 1,
      name: "Walk-in Retail Customer",
      phone: "+250 780 000 000",
      id_number: "RETAIL",
      email: "retail@vectos.rw",
      credit_balance: 0,
    },
  ];

  orders: OrderRecord[] = [
    {
      id: 1,
      shop_id: 1,
      stock_id: 1,
      order_number: "ORD-20261023-001",
      customer_id: 1,
      salesperson_id: 1,
      total_amount: 1594000,
      paid_amount: 1144000,
      debt_amount: 450000,
      payment_status: "partial",
      fulfillment_status: "completed",
      notes: "Delivered to Kagarama Site 4",
      created_at: new Date("2026-10-23T08:30:00Z"),
    },
    {
      id: 2,
      shop_id: 1,
      stock_id: 1,
      order_number: "ORD-20261023-002",
      customer_id: 5,
      salesperson_id: 3,
      total_amount: 275000,
      paid_amount: 275000,
      debt_amount: 0,
      payment_status: "paid",
      fulfillment_status: "completed",
      notes: "Cash counter sale",
      created_at: new Date("2026-10-23T11:15:00Z"),
    },
    {
      id: 3,
      shop_id: 1,
      stock_id: 1,
      order_number: "ORD-20261023-003",
      customer_id: 2,
      salesperson_id: 1,
      total_amount: 319000,
      paid_amount: 134000,
      debt_amount: 185000,
      payment_status: "partial",
      fulfillment_status: "completed",
      notes: "Plumbing pipes and grinders for Kimihurura site",
      created_at: new Date("2026-10-23T14:45:00Z"),
    },
  ];

  orderItems: OrderItemRecord[] = [
    {
      id: 1,
      order_id: 1,
      product_id: 1,
      quantity: 100,
      buying_price: 10500,
      selling_price: 12500,
      subtotal: 1250000,
      profit: 200000,
    },
    {
      id: 2,
      order_id: 1,
      product_id: 4,
      quantity: 20,
      buying_price: 14500,
      selling_price: 17200,
      subtotal: 344000,
      profit: 54000,
    },
    {
      id: 3,
      order_id: 2,
      product_id: 7,
      quantity: 2,
      buying_price: 68000,
      selling_price: 79500,
      subtotal: 159000,
      profit: 23000,
    },
    {
      id: 4,
      order_id: 2,
      product_id: 8,
      quantity: 4,
      buying_price: 22000,
      selling_price: 29000,
      subtotal: 116000,
      profit: 28000,
    },
    {
      id: 5,
      order_id: 3,
      product_id: 6,
      quantity: 10,
      buying_price: 18000,
      selling_price: 22500,
      subtotal: 225000,
      profit: 45000,
    },
    {
      id: 6,
      order_id: 3,
      product_id: 11,
      quantity: 2,
      buying_price: 38000,
      selling_price: 47000,
      subtotal: 94000,
      profit: 18000,
    },
  ];

  payments: PaymentRecord[] = [
    {
      id: 1,
      shop_id: 1,
      order_id: 1,
      amount: 1144000,
      payment_method: "momo",
      reference_no: "MOMO-9842018392",
      recorded_by: 1,
      created_at: new Date("2026-10-23T08:35:00Z"),
    },
    {
      id: 2,
      shop_id: 1,
      order_id: 2,
      amount: 275000,
      payment_method: "cash",
      reference_no: "CASH-REC-002",
      recorded_by: 3,
      created_at: new Date("2026-10-23T11:15:00Z"),
    },
    {
      id: 3,
      shop_id: 1,
      order_id: 3,
      amount: 134000,
      payment_method: "bank_transfer",
      reference_no: "BK-TXN-4910283",
      recorded_by: 1,
      created_at: new Date("2026-10-23T14:48:00Z"),
    },
  ];

  inventoryMovements: InventoryMovementRecord[] = [
    {
      id: 1,
      shop_id: 1,
      product_id: 1,
      quantity: 500,
      movement_type: "Stock Received",
      performed_by: 1,
      created_at: new Date("2026-10-20T09:00:00Z"),
    },
    {
      id: 2,
      shop_id: 1,
      product_id: 1,
      quantity: -100,
      movement_type: "Sale",
      performed_by: 1,
      created_at: new Date("2026-10-23T08:30:00Z"),
    },
    {
      id: 3,
      shop_id: 1,
      product_id: 4,
      quantity: -20,
      movement_type: "Sale",
      performed_by: 1,
      created_at: new Date("2026-10-23T08:30:00Z"),
    },
    {
      id: 4,
      shop_id: 1,
      product_id: 7,
      quantity: -2,
      movement_type: "Sale",
      performed_by: 3,
      created_at: new Date("2026-10-23T11:15:00Z"),
    },
    {
      id: 5,
      shop_id: 1,
      product_id: 5,
      quantity: -2,
      movement_type: "Damage",
      performed_by: 4,
      created_at: new Date("2026-10-22T16:00:00Z"),
    },
  ];
}

const memoryStore = new MemoryStore();

// DATA ACCESS LAYER EXPORTS
export const dataStore = {
  // SHOPS
  async getShops(): Promise<ShopRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const result = await db.select().from(shops);
        return result as ShopRecord[];
      } catch (e) {
        console.error("Neon DB error in getShops:", e);
      }
    }
    return memoryStore.shops;
  },

  async getShopById(id: number): Promise<ShopRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db.select().from(shops).where(eq(shops.id, id));
        return (result as ShopRecord) || null;
      } catch (e) {
        console.error("Neon DB error in getShopById:", e);
      }
    }
    return memoryStore.shops.find((s) => s.id === id) || null;
  },

  async createShop(data: Partial<ShopRecord>): Promise<ShopRecord> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .insert(shops)
          .values({
            name: data.name!,
            code: data.code!,
            owner_name: data.owner_name || null,
            phone: data.phone || null,
            email: data.email || null,
            location: data.location || null,
            tin_number: data.tin_number || null,
            status: data.status || "active",
            subscription_plan: data.subscription_plan || "enterprise",
          })
          .returning();

        // Also create a default main stock warehouse for the new shop
        await db.insert(stocks).values({
          shop_id: result.id,
          name: "Main Depot",
          code: `WH-${result.code}-01`,
          location: data.location || "Central Depot",
          manager_name: data.owner_name || "Manager",
          is_main: 1,
          status: "active",
        });

        return result as ShopRecord;
      } catch (e) {
        console.error("Neon DB error in createShop:", e);
      }
    }

    const newId = memoryStore.shops.length > 0 ? Math.max(...memoryStore.shops.map((s) => s.id)) + 1 : 1;
    const newShop: ShopRecord = {
      id: newId,
      name: data.name || "New Shop",
      code: data.code || `SHOP-${newId}`,
      owner_name: data.owner_name || null,
      phone: data.phone || null,
      email: data.email || null,
      location: data.location || null,
      tin_number: data.tin_number || null,
      status: data.status || "active",
      subscription_plan: data.subscription_plan || "professional",
      created_at: new Date(),
    };
    memoryStore.shops.push(newShop);

    // Auto create default warehouse depot for new shop
    const newStockId = memoryStore.stocks.length > 0 ? Math.max(...memoryStore.stocks.map((s) => s.id)) + 1 : 1;
    memoryStore.stocks.push({
      id: newStockId,
      shop_id: newId,
      name: "Main Depot",
      code: `WH-${newShop.code}-01`,
      location: newShop.location,
      manager_name: newShop.owner_name,
      is_main: 1,
      status: "active",
    });

    return newShop;
  },

  async updateShop(id: number, data: Partial<ShopRecord>): Promise<ShopRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db.update(shops).set(data).where(eq(shops.id, id)).returning();
        return (result as ShopRecord) || null;
      } catch (e) {
        console.error("Neon DB error in updateShop:", e);
      }
    }

    const idx = memoryStore.shops.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    memoryStore.shops[idx] = { ...memoryStore.shops[idx], ...data };
    return memoryStore.shops[idx];
  },

  // STOCKS / WAREHOUSES
  async getStocks(shopId: number): Promise<StockRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const result = await db.select().from(stocks).where(eq(stocks.shop_id, shopId));
        return result as StockRecord[];
      } catch (e) {
        console.error("Neon DB error in getStocks:", e);
      }
    }
    return memoryStore.stocks.filter((st) => st.shop_id === shopId);
  },

  async createStock(shopId: number, data: Partial<StockRecord>): Promise<StockRecord> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .insert(stocks)
          .values({
            shop_id: shopId,
            name: data.name!,
            code: data.code!,
            location: data.location || null,
            manager_name: data.manager_name || null,
            is_main: data.is_main || 0,
            status: data.status || "active",
          })
          .returning();
        return result as StockRecord;
      } catch (e) {
        console.error("Neon DB error in createStock:", e);
      }
    }

    const newId = memoryStore.stocks.length > 0 ? Math.max(...memoryStore.stocks.map((s) => s.id)) + 1 : 1;
    const newStock: StockRecord = {
      id: newId,
      shop_id: shopId,
      name: data.name || "Secondary Depot",
      code: data.code || `STK-${newId}`,
      location: data.location || null,
      manager_name: data.manager_name || null,
      is_main: data.is_main || 0,
      status: data.status || "active",
    };
    memoryStore.stocks.push(newStock);
    return newStock;
  },

  // USERS
  async getUsers(shopId: number): Promise<UserRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const result = await db.select().from(users).where(eq(users.shop_id, shopId));
        return result as UserRecord[];
      } catch (e) {
        console.error("Neon DB error in getUsers:", e);
      }
    }
    return memoryStore.users.filter((u) => u.shop_id === shopId || u.role === "superadmin");
  },

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db.select().from(users).where(eq(users.email, cleanEmail));
        return (result as UserRecord) || null;
      } catch (e) {
        console.error("Neon DB error in getUserByEmail:", e);
      }
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id: number): Promise<UserRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db.select().from(users).where(eq(users.id, id));
        return (result as UserRecord) || null;
      } catch (e) {
        console.error("Neon DB error in getUserById:", e);
      }
    }
    return memoryStore.users.find((u) => u.id === id) || null;
  },

  async createUser(data: Partial<UserRecord>): Promise<UserRecord> {
    const hashedPassword = await bcrypt.hash(data.password || "Password123!", 10);
    const cleanEmail = data.email!.toLowerCase().trim();

    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .insert(users)
          .values({
            shop_id: data.shop_id || null,
            stock_id: data.stock_id || null,
            name: data.name!,
            email: cleanEmail,
            password: hashedPassword,
            role: data.role || "cashier",
            job_title: data.job_title || null,
            phone: data.phone || null,
            is_active: data.is_active ?? 1,
            can_create_orders: data.can_create_orders ?? 1,
            can_process_payments: data.can_process_payments ?? 1,
            can_release_stock: data.can_release_stock ?? 0,
            can_manage_stock: data.can_manage_stock ?? 0,
            can_view_reports: data.can_view_reports ?? 1,
            can_give_discounts: data.can_give_discounts ?? 0,
            can_manage_users: data.can_manage_users ?? 0,
            can_void_orders: data.can_void_orders ?? 0,
          })
          .returning();
        return result as UserRecord;
      } catch (e) {
        console.error("Neon DB error in createUser:", e);
      }
    }

    const newId = memoryStore.users.length > 0 ? Math.max(...memoryStore.users.map((u) => u.id)) + 1 : 1;
    const newUser: UserRecord = {
      id: newId,
      shop_id: data.shop_id || 1,
      stock_id: data.stock_id || 1,
      name: data.name!,
      email: cleanEmail,
      password: hashedPassword,
      role: data.role || "cashier",
      job_title: data.job_title || null,
      phone: data.phone || null,
      is_active: data.is_active ?? 1,
      can_create_orders: data.can_create_orders ?? 1,
      can_process_payments: data.can_process_payments ?? 1,
      can_release_stock: data.can_release_stock ?? 0,
      can_manage_stock: data.can_manage_stock ?? 0,
      can_view_reports: data.can_view_reports ?? 1,
      can_give_discounts: data.can_give_discounts ?? 0,
      can_manage_users: data.can_manage_users ?? 0,
      can_void_orders: data.can_void_orders ?? 0,
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async updateUser(id: number, data: Partial<UserRecord>): Promise<UserRecord | null> {
    const updatePayload: Record<string, any> = { ...data };
    if (updatePayload.password) {
      updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
    }
    if (updatePayload.email) {
      updatePayload.email = updatePayload.email.toLowerCase().trim();
    }

    if (isConnectedToNeon && db) {
      try {
        const [result] = await db.update(users).set(updatePayload).where(eq(users.id, id)).returning();
        return (result as UserRecord) || null;
      } catch (e) {
        console.error("Neon DB error in updateUser:", e);
      }
    }

    const idx = memoryStore.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    memoryStore.users[idx] = { ...memoryStore.users[idx], ...updatePayload };
    return memoryStore.users[idx];
  },

  // PRODUCTS
  async getProducts(
    shopId: number,
    filters?: { category?: string; lowStockOnly?: boolean; search?: string }
  ): Promise<ProductRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const conditions = [eq(products.shop_id, shopId)];
        if (filters?.category) {
          conditions.push(eq(products.category, filters.category));
        }
        const result = await db.select().from(products).where(and(...conditions));
        let list = result as ProductRecord[];
        if (filters?.lowStockOnly) {
          list = list.filter((p) => (p.quantity || 0) <= (p.low_stock_threshold || 10));
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.sku && p.sku.toLowerCase().includes(q)) ||
              (p.barcode && p.barcode.toLowerCase().includes(q))
          );
        }
        return list;
      } catch (e) {
        console.error("Neon DB error in getProducts:", e);
      }
    }

    let list = memoryStore.products.filter((p) => p.shop_id === shopId);
    if (filters?.category && filters.category !== "All") {
      list = list.filter((p) => p.category === filters.category);
    }
    if (filters?.lowStockOnly) {
      list = list.filter((p) => (p.quantity || 0) <= (p.low_stock_threshold || 10));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getProductById(id: number, shopId?: number): Promise<ProductRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const conditions = [eq(products.id, id)];
        if (shopId) conditions.push(eq(products.shop_id, shopId));
        const [result] = await db.select().from(products).where(and(...conditions));
        return (result as ProductRecord) || null;
      } catch (e) {
        console.error("Neon DB error in getProductById:", e);
      }
    }
    return memoryStore.products.find((p) => p.id === id && (!shopId || p.shop_id === shopId)) || null;
  },

  async createProduct(shopId: number, data: Partial<ProductRecord>): Promise<ProductRecord> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .insert(products)
          .values({
            shop_id: shopId,
            stock_id: data.stock_id || null,
            name: data.name!,
            sku: data.sku || null,
            barcode: data.barcode || null,
            category: data.category || "General",
            unit: data.unit || "pcs",
            buying_price: String(data.buying_price || 0),
            selling_price: String(data.selling_price || 0),
            quantity: Number(data.quantity) || 0,
            low_stock_threshold: Number(data.low_stock_threshold) || 10,
            description: data.description || null,
          })
          .returning();
        return result as ProductRecord;
      } catch (e) {
        console.error("Neon DB error in createProduct:", e);
      }
    }

    const newId = memoryStore.products.length > 0 ? Math.max(...memoryStore.products.map((p) => p.id)) + 1 : 1;
    const newProduct: ProductRecord = {
      id: newId,
      shop_id: shopId,
      stock_id: data.stock_id || 1,
      name: data.name!,
      sku: data.sku || `SKU-${newId}`,
      barcode: data.barcode || `600${newId.toString().padStart(6, "0")}`,
      category: data.category || "General",
      unit: data.unit || "pcs",
      buying_price: Number(data.buying_price) || 0,
      selling_price: Number(data.selling_price) || 0,
      quantity: Number(data.quantity) || 0,
      low_stock_threshold: Number(data.low_stock_threshold) || 10,
      description: data.description || null,
    };
    memoryStore.products.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: number, shopId: number, data: Partial<ProductRecord>): Promise<ProductRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .update(products)
          .set(data as any)
          .where(and(eq(products.id, id), eq(products.shop_id, shopId)))
          .returning();
        return (result as ProductRecord) || null;
      } catch (e) {
        console.error("Neon DB error in updateProduct:", e);
      }
    }

    const idx = memoryStore.products.findIndex((p) => p.id === id && p.shop_id === shopId);
    if (idx === -1) return null;
    memoryStore.products[idx] = { ...memoryStore.products[idx], ...data };
    return memoryStore.products[idx];
  },

  async deleteProduct(id: number, shopId: number): Promise<boolean> {
    if (isConnectedToNeon && db) {
      try {
        await db.delete(products).where(and(eq(products.id, id), eq(products.shop_id, shopId)));
        return true;
      } catch (e) {
        console.error("Neon DB error in deleteProduct:", e);
      }
    }

    const idx = memoryStore.products.findIndex((p) => p.id === id && p.shop_id === shopId);
    if (idx !== -1) {
      memoryStore.products.splice(idx, 1);
      return true;
    }
    return false;
  },

  // CUSTOMERS
  async getCustomers(shopId: number, search?: string): Promise<CustomerRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const result = await db.select().from(customers).where(eq(customers.shop_id, shopId));
        let list = result as CustomerRecord[];
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.phone && c.phone.includes(q)) ||
              (c.id_number && c.id_number.includes(q))
          );
        }
        return list;
      } catch (e) {
        console.error("Neon DB error in getCustomers:", e);
      }
    }

    let list = memoryStore.customers.filter((c) => c.shop_id === shopId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.id_number && c.id_number.includes(q))
      );
    }
    return list;
  },

  async getCustomerById(id: number, shopId: number): Promise<CustomerRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .select()
          .from(customers)
          .where(and(eq(customers.id, id), eq(customers.shop_id, shopId)));
        return (result as CustomerRecord) || null;
      } catch (e) {
        console.error("Neon DB error in getCustomerById:", e);
      }
    }
    return memoryStore.customers.find((c) => c.id === id && c.shop_id === shopId) || null;
  },

  async createCustomer(shopId: number, data: Partial<CustomerRecord>): Promise<CustomerRecord> {
    if (isConnectedToNeon && db) {
      try {
        const [result] = await db
          .insert(customers)
          .values({
            shop_id: shopId,
            name: data.name!,
            phone: data.phone || null,
            id_number: data.id_number || null,
            email: data.email || null,
            credit_balance: String(data.credit_balance || 0),
          })
          .returning();
        return result as CustomerRecord;
      } catch (e) {
        console.error("Neon DB error in createCustomer:", e);
      }
    }

    const newId = memoryStore.customers.length > 0 ? Math.max(...memoryStore.customers.map((c) => c.id)) + 1 : 1;
    const newCust: CustomerRecord = {
      id: newId,
      shop_id: shopId,
      name: data.name!,
      phone: data.phone || null,
      id_number: data.id_number || null,
      email: data.email || null,
      credit_balance: Number(data.credit_balance) || 0,
    };
    memoryStore.customers.push(newCust);
    return newCust;
  },

  // ORDERS & POS TRANSACTIONS
  async createOrder(
    shopId: number,
    orderInput: {
      stock_id?: number;
      customer_id?: number;
      salesperson_id?: number;
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
    }
  ): Promise<OrderRecord> {
    const timestampStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${timestampStr}-${randomSuffix}`;

    let totalAmount = 0;
    const computedItems: {
      product_id: number;
      product_name: string;
      quantity: number;
      buying_price: number;
      selling_price: number;
      subtotal: number;
      profit: number;
    }[] = [];

    // Calculate totals, profit, verify stock
    for (const item of orderInput.items) {
      const product = await this.getProductById(item.product_id, shopId);
      if (!product) {
        throw new Error(`Product ID ${item.product_id} not found for this store.`);
      }
      const buying = Number(product.buying_price);
      const selling = item.selling_price ? Number(item.selling_price) : Number(product.selling_price);
      const subtotal = selling * item.quantity;
      const profit = (selling - buying) * item.quantity;
      totalAmount += subtotal;

      computedItems.push({
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        buying_price: buying,
        selling_price: selling,
        subtotal,
        profit,
      });

      // Deduct inventory
      const newQty = (product.quantity || 0) - item.quantity;
      await this.updateProduct(product.id, shopId, { quantity: newQty });

      // Log movement
      await this.recordMovement({
        shop_id: shopId,
        product_id: product.id,
        quantity: -item.quantity,
        movement_type: "Sale",
        performed_by: orderInput.salesperson_id || null,
      });
    }

    const paidAmount = orderInput.payment ? Number(orderInput.payment.amount) : 0;
    const debtAmount = Math.max(0, totalAmount - paidAmount);
    let paymentStatus: "paid" | "partial" | "debt" = "paid";
    if (paidAmount === 0) {
      paymentStatus = "debt";
    } else if (debtAmount > 0) {
      paymentStatus = "partial";
    }

    // If customer has debt, increment customer credit_balance
    if (debtAmount > 0 && orderInput.customer_id) {
      const cust = await this.getCustomerById(orderInput.customer_id, shopId);
      if (cust) {
        const newBalance = Number(cust.credit_balance || 0) + debtAmount;
        if (isConnectedToNeon && db) {
          try {
            await db
              .update(customers)
              .set({ credit_balance: String(newBalance) })
              .where(eq(customers.id, cust.id));
          } catch (e) {
            console.error("Error updating customer balance:", e);
          }
        }
        const custIdx = memoryStore.customers.findIndex((c) => c.id === cust.id);
        if (custIdx !== -1) {
          memoryStore.customers[custIdx].credit_balance = newBalance;
        }
      }
    }

    // Insert order in DB
    if (isConnectedToNeon && db) {
      try {
        const [insertedOrder] = await db
          .insert(orders)
          .values({
            shop_id: shopId,
            stock_id: orderInput.stock_id || null,
            order_number: orderNumber,
            customer_id: orderInput.customer_id || null,
            salesperson_id: orderInput.salesperson_id || null,
            total_amount: String(totalAmount),
            paid_amount: String(paidAmount),
            debt_amount: String(debtAmount),
            payment_status: paymentStatus,
            fulfillment_status: "completed",
            notes: orderInput.notes || null,
          })
          .returning();

        // Insert items
        for (const it of computedItems) {
          await db.insert(orderItems).values({
            order_id: insertedOrder.id,
            product_id: it.product_id,
            quantity: it.quantity,
            buying_price: String(it.buying_price),
            selling_price: String(it.selling_price),
            subtotal: String(it.subtotal),
            profit: String(it.profit),
          });
        }

        // Insert payment if provided
        if (orderInput.payment && paidAmount > 0) {
          await db.insert(payments).values({
            shop_id: shopId,
            order_id: insertedOrder.id,
            amount: String(paidAmount),
            payment_method: orderInput.payment.payment_method,
            reference_no: orderInput.payment.reference_no || null,
            recorded_by: orderInput.salesperson_id || null,
          });
        }

        return (await this.getOrderById(insertedOrder.id, shopId)) as OrderRecord;
      } catch (e) {
        console.error("Neon DB error in createOrder:", e);
      }
    }

    // Memory Store Fallback
    const newOrderId = memoryStore.orders.length > 0 ? Math.max(...memoryStore.orders.map((o) => o.id)) + 1 : 1;
    const newOrder: OrderRecord = {
      id: newOrderId,
      shop_id: shopId,
      stock_id: orderInput.stock_id || 1,
      order_number: orderNumber,
      customer_id: orderInput.customer_id || null,
      salesperson_id: orderInput.salesperson_id || null,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      debt_amount: debtAmount,
      payment_status: paymentStatus,
      fulfillment_status: "completed",
      notes: orderInput.notes || null,
      created_at: new Date(),
    };
    memoryStore.orders.unshift(newOrder);

    // Items
    for (const it of computedItems) {
      const newItemId = memoryStore.orderItems.length > 0 ? Math.max(...memoryStore.orderItems.map((i) => i.id)) + 1 : 1;
      memoryStore.orderItems.push({
        id: newItemId,
        order_id: newOrderId,
        product_id: it.product_id,
        quantity: it.quantity,
        buying_price: it.buying_price,
        selling_price: it.selling_price,
        subtotal: it.subtotal,
        profit: it.profit,
        product_name: it.product_name,
      });
    }

    // Payment record
    if (orderInput.payment && paidAmount > 0) {
      const newPayId = memoryStore.payments.length > 0 ? Math.max(...memoryStore.payments.map((p) => p.id)) + 1 : 1;
      memoryStore.payments.unshift({
        id: newPayId,
        shop_id: shopId,
        order_id: newOrderId,
        amount: paidAmount,
        payment_method: orderInput.payment.payment_method,
        reference_no: orderInput.payment.reference_no || null,
        recorded_by: orderInput.salesperson_id || null,
        created_at: new Date(),
      });
    }

    return (await this.getOrderById(newOrderId, shopId)) as OrderRecord;
  },

  async getOrders(
    shopId: number,
    filters?: { customerId?: number; paymentStatus?: string; limit?: number }
  ): Promise<OrderRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const conditions = [eq(orders.shop_id, shopId)];
        if (filters?.customerId) conditions.push(eq(orders.customer_id, filters.customerId));
        if (filters?.paymentStatus) conditions.push(eq(orders.payment_status, filters.paymentStatus));

        const result = await db
          .select()
          .from(orders)
          .where(and(...conditions))
          .orderBy(desc(orders.created_at))
          .limit(filters?.limit || 100);

        const fullOrders: OrderRecord[] = [];
        for (const ord of result) {
          const itemsResult = await db.select().from(orderItems).where(eq(orderItems.order_id, ord.id));
          fullOrders.push({
            ...(ord as any),
            items: itemsResult as any,
          });
        }
        return fullOrders;
      } catch (e) {
        console.error("Neon DB error in getOrders:", e);
      }
    }

    let list = memoryStore.orders.filter((o) => o.shop_id === shopId);
    if (filters?.customerId) {
      list = list.filter((o) => o.customer_id === filters.customerId);
    }
    if (filters?.paymentStatus && filters.paymentStatus !== "All") {
      list = list.filter((o) => o.payment_status === filters.paymentStatus);
    }

    return list.slice(0, filters?.limit || 100).map((ord) => {
      const items = memoryStore.orderItems
        .filter((it) => it.order_id === ord.id)
        .map((it) => {
          const p = memoryStore.products.find((prod) => prod.id === it.product_id);
          return { ...it, product_name: p ? p.name : `Product #${it.product_id}` };
        });
      const cust = memoryStore.customers.find((c) => c.id === ord.customer_id);
      const user = memoryStore.users.find((u) => u.id === ord.salesperson_id);
      return {
        ...ord,
        items,
        customer: cust || null,
        salesperson: user ? { id: user.id, name: user.name } : null,
      };
    });
  },

  async getOrderById(id: number, shopId: number): Promise<OrderRecord | null> {
    if (isConnectedToNeon && db) {
      try {
        const [ord] = await db
          .select()
          .from(orders)
          .where(and(eq(orders.id, id), eq(orders.shop_id, shopId)));
        if (!ord) return null;
        const items = await db.select().from(orderItems).where(eq(orderItems.order_id, id));
        let cust = null;
        if (ord.customer_id) {
          const [c] = await db.select().from(customers).where(eq(customers.id, ord.customer_id));
          cust = c || null;
        }
        return {
          ...(ord as any),
          items: items as any,
          customer: cust as any,
        };
      } catch (e) {
        console.error("Neon DB error in getOrderById:", e);
      }
    }

    const ord = memoryStore.orders.find((o) => o.id === id && o.shop_id === shopId);
    if (!ord) return null;
    const items = memoryStore.orderItems
      .filter((it) => it.order_id === id)
      .map((it) => {
        const p = memoryStore.products.find((prod) => prod.id === it.product_id);
        return { ...it, product_name: p ? p.name : `Product #${it.product_id}` };
      });
    const cust = memoryStore.customers.find((c) => c.id === ord.customer_id);
    const user = memoryStore.users.find((u) => u.id === ord.salesperson_id);
    return {
      ...ord,
      items,
      customer: cust || null,
      salesperson: user ? { id: user.id, name: user.name } : null,
    };
  },

  // CUSTOMER DEBT LEDGER & INSTALLMENT PAYMENTS
  async recordDebtPayment(
    shopId: number,
    data: {
      customer_id: number;
      order_id?: number | null;
      amount: number;
      payment_method: "cash" | "momo" | "bank_transfer" | "debt_credit";
      reference_no?: string;
      recorded_by: number;
    }
  ): Promise<{ payment: PaymentRecord; updatedBalance: number }> {
    const cust = await this.getCustomerById(data.customer_id, shopId);
    if (!cust) throw new Error("Customer not found");

    const currentBalance = Number(cust.credit_balance || 0);
    const newBalance = Math.max(0, currentBalance - data.amount);

    // Update customer credit balance
    if (isConnectedToNeon && db) {
      try {
        await db
          .update(customers)
          .set({ credit_balance: String(newBalance) })
          .where(eq(customers.id, data.customer_id));
      } catch (e) {
        console.error("Error updating customer balance:", e);
      }
    }
    const custIdx = memoryStore.customers.findIndex((c) => c.id === data.customer_id);
    if (custIdx !== -1) {
      memoryStore.customers[custIdx].credit_balance = newBalance;
    }

    // If specific orderId was given, adjust order debt
    if (data.order_id) {
      const ord = await this.getOrderById(data.order_id, shopId);
      if (ord) {
        const orderDebt = Number(ord.debt_amount || 0);
        const newOrderDebt = Math.max(0, orderDebt - data.amount);
        const newPaidAmount = Number(ord.paid_amount || 0) + data.amount;
        const newStatus: "paid" | "partial" | "debt" = newOrderDebt === 0 ? "paid" : "partial";

        if (isConnectedToNeon && db) {
          try {
            await db
              .update(orders)
              .set({
                debt_amount: String(newOrderDebt),
                paid_amount: String(newPaidAmount),
                payment_status: newStatus,
              })
              .where(eq(orders.id, data.order_id));
          } catch (e) {
            console.error("Error updating order debt:", e);
          }
        }
        const oIdx = memoryStore.orders.findIndex((o) => o.id === data.order_id);
        if (oIdx !== -1) {
          memoryStore.orders[oIdx].debt_amount = newOrderDebt;
          memoryStore.orders[oIdx].paid_amount = newPaidAmount;
          memoryStore.orders[oIdx].payment_status = newStatus;
        }
      }
    }

    // Insert payment record
    let newPayment: PaymentRecord;
    if (isConnectedToNeon && db) {
      try {
        const [inserted] = await db
          .insert(payments)
          .values({
            shop_id: shopId,
            order_id: data.order_id || null,
            amount: String(data.amount),
            payment_method: data.payment_method,
            reference_no: data.reference_no || null,
            recorded_by: data.recorded_by,
          })
          .returning();
        newPayment = inserted as PaymentRecord;
      } catch (e) {
        console.error("Neon DB error in recordDebtPayment:", e);
      }
    }

    const newPayId = memoryStore.payments.length > 0 ? Math.max(...memoryStore.payments.map((p) => p.id)) + 1 : 1;
    newPayment = {
      id: newPayId,
      shop_id: shopId,
      order_id: data.order_id || null,
      amount: data.amount,
      payment_method: data.payment_method,
      reference_no: data.reference_no || null,
      recorded_by: data.recorded_by,
      created_at: new Date(),
    };
    memoryStore.payments.unshift(newPayment);

    return { payment: newPayment, updatedBalance: newBalance };
  },

  async getPayments(shopId: number): Promise<PaymentRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const result = await db
          .select()
          .from(payments)
          .where(eq(payments.shop_id, shopId))
          .orderBy(desc(payments.created_at));
        return result as PaymentRecord[];
      } catch (e) {
        console.error("Neon DB error in getPayments:", e);
      }
    }

    return memoryStore.payments
      .filter((p) => p.shop_id === shopId)
      .map((p) => {
        const recUser = memoryStore.users.find((u) => u.id === p.recorded_by);
        const ord = p.order_id ? memoryStore.orders.find((o) => o.id === p.order_id) : null;
        return {
          ...p,
          recorded_by_name: recUser?.name || "System",
          order_number: ord?.order_number,
        };
      });
  },

  // INVENTORY MOVEMENTS & STOCK INTAKE
  async recordMovement(data: {
    shop_id: number;
    product_id: number;
    quantity: number;
    movement_type: "Stock Received" | "Sale" | "Adjustment" | "Damage" | "Return";
    performed_by: number | null;
  }): Promise<InventoryMovementRecord> {
    if (isConnectedToNeon && db) {
      try {
        const [inserted] = await db
          .insert(inventoryMovements)
          .values({
            shop_id: data.shop_id,
            product_id: data.product_id,
            quantity: data.quantity,
            movement_type: data.movement_type,
            performed_by: data.performed_by,
          })
          .returning();
        return inserted as InventoryMovementRecord;
      } catch (e) {
        console.error("Neon DB error in recordMovement:", e);
      }
    }

    const newId =
      memoryStore.inventoryMovements.length > 0
        ? Math.max(...memoryStore.inventoryMovements.map((m) => m.id)) + 1
        : 1;
    const newMovement: InventoryMovementRecord = {
      id: newId,
      shop_id: data.shop_id,
      product_id: data.product_id,
      quantity: data.quantity,
      movement_type: data.movement_type,
      performed_by: data.performed_by,
      created_at: new Date(),
    };
    memoryStore.inventoryMovements.unshift(newMovement);
    return newMovement;
  },

  async recordStockIntake(
    shopId: number,
    data: {
      product_id: number;
      quantity: number;
      buying_price?: number;
      selling_price?: number;
      performed_by: number;
    }
  ): Promise<ProductRecord> {
    const prod = await this.getProductById(data.product_id, shopId);
    if (!prod) throw new Error("Product not found");

    const updatedQty = (prod.quantity || 0) + data.quantity;
    const updateData: Partial<ProductRecord> = { quantity: updatedQty };
    if (data.buying_price !== undefined) updateData.buying_price = data.buying_price;
    if (data.selling_price !== undefined) updateData.selling_price = data.selling_price;

    const updated = await this.updateProduct(prod.id, shopId, updateData);
    await this.recordMovement({
      shop_id: shopId,
      product_id: prod.id,
      quantity: data.quantity,
      movement_type: "Stock Received",
      performed_by: data.performed_by,
    });

    return updated!;
  },

  async getMovements(shopId: number, productId?: number): Promise<InventoryMovementRecord[]> {
    if (isConnectedToNeon && db) {
      try {
        const conditions = [eq(inventoryMovements.shop_id, shopId)];
        if (productId) conditions.push(eq(inventoryMovements.product_id, productId));
        const result = await db
          .select()
          .from(inventoryMovements)
          .where(and(...conditions))
          .orderBy(desc(inventoryMovements.created_at))
          .limit(100);
        return result as InventoryMovementRecord[];
      } catch (e) {
        console.error("Neon DB error in getMovements:", e);
      }
    }

    let list = memoryStore.inventoryMovements.filter((m) => m.shop_id === shopId);
    if (productId) {
      list = list.filter((m) => m.product_id === productId);
    }
    return list.slice(0, 100).map((m) => {
      const p = memoryStore.products.find((prod) => prod.id === m.product_id);
      const u = memoryStore.users.find((user) => user.id === m.performed_by);
      return {
        ...m,
        product_name: p?.name || `Product #${m.product_id}`,
        performed_by_name: u?.name || "System",
      };
    });
  },

  // REPORTS & AUDIT TRAIL
  async getReports(shopId: number) {
    const shopOrders = await this.getOrders(shopId, { limit: 1000 });
    const shopPayments = await this.getPayments(shopId);
    const shopProducts = await this.getProducts(shopId);
    const shopCustomers = await this.getCustomers(shopId);

    // Total metrics
    let totalRevenue = 0;
    let totalCollected = 0;
    let totalOutstandingDebt = 0;
    let totalGrossProfit = 0;

    for (const ord of shopOrders) {
      totalRevenue += Number(ord.total_amount);
      totalCollected += Number(ord.paid_amount);
      totalOutstandingDebt += Number(ord.debt_amount || 0);

      if (ord.items) {
        for (const item of ord.items) {
          totalGrossProfit += Number(item.profit || 0);
        }
      }
    }

    // Cash reconciliation breakdown
    const reconciliation = {
      cash: 0,
      momo: 0,
      bank_transfer: 0,
      debt_credit: totalOutstandingDebt,
    };

    for (const p of shopPayments) {
      const amt = Number(p.amount);
      if (p.payment_method === "cash") reconciliation.cash += amt;
      else if (p.payment_method === "momo") reconciliation.momo += amt;
      else if (p.payment_method === "bank_transfer") reconciliation.bank_transfer += amt;
    }

    // Top products
    const productStats: Record<number, { name: string; quantity: number; revenue: number }> = {};
    for (const ord of shopOrders) {
      if (ord.items) {
        for (const it of ord.items) {
          if (!productStats[it.product_id]) {
            productStats[it.product_id] = {
              name: it.product_name || `Product #${it.product_id}`,
              quantity: 0,
              revenue: 0,
            };
          }
          productStats[it.product_id].quantity += Number(it.quantity);
          productStats[it.product_id].revenue += Number(it.subtotal);
        }
      }
    }

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Low stock alerts
    const lowStockAlerts = shopProducts.filter(
      (p) => (p.quantity || 0) <= (p.low_stock_threshold || 10)
    );

    return {
      overview: {
        totalRevenue,
        totalCollected,
        totalOutstandingDebt,
        totalGrossProfit,
        profitMarginPct: totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : "0",
        totalOrdersCount: shopOrders.length,
        totalProductsCount: shopProducts.length,
        totalCustomersCount: shopCustomers.length,
        lowStockItemsCount: lowStockAlerts.length,
      },
      reconciliation,
      topProducts,
      lowStockAlerts,
    };
  },

  // SUPERADMIN CROSS-STORE AGGREGATES
  async getSuperadminStats() {
    const allShops = await this.getShops();
    let totalNetworkRevenue = 0;
    let totalNetworkOrders = 0;
    const storeBreakdown = [];

    for (const s of allShops) {
      const rep = await this.getReports(s.id);
      totalNetworkRevenue += rep.overview.totalRevenue;
      totalNetworkOrders += rep.overview.totalOrdersCount;
      storeBreakdown.push({
        id: s.id,
        name: s.name,
        code: s.code,
        location: s.location,
        status: s.status,
        plan: s.subscription_plan,
        revenue: rep.overview.totalRevenue,
        ordersCount: rep.overview.totalOrdersCount,
        productsCount: rep.overview.totalProductsCount,
      });
    }

    return {
      totalShops: allShops.length,
      totalNetworkRevenue,
      totalNetworkOrders,
      storeBreakdown,
    };
  },
};
