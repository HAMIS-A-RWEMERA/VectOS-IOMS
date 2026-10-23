import bcrypt from "bcryptjs";
import { db, schema, isConnectedToNeon } from "./index";
import { shops, stocks, users, products, customers, orders, orderItems, payments, inventoryMovements } from "./schema";

export async function runSeed() {
  console.log("[Seed] Starting initial database seeding...");

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt);

  if (isConnectedToNeon && db) {
    try {
      console.log("[Seed] Seeding Neon PostgreSQL Database...");
      // 1. Seed Shops
      const [insertedShop1] = await db
        .insert(shops)
        .values({
          name: "Vectos Hardware & Building Materials Ltd",
          code: "VECTOS-KGL-01",
          owner_name: "Patrick Rwemera",
          phone: "+250 788 123 456",
          email: "rwemera30@gmail.com",
          location: "Kigali, Gikondo Industrial Zone",
          tin_number: "100234567",
          status: "active",
          subscription_plan: "enterprise",
        })
        .onConflictDoNothing()
        .returning();

      const [insertedShop2] = await db
        .insert(shops)
        .values({
          name: "Nyarugenge Electrical & Hardware Depot",
          code: "NYARU-ELEC-02",
          owner_name: "Aline Uwase",
          phone: "+250 788 654 321",
          email: "aline@nyarugenge-elec.rw",
          location: "Kigali, Nyarugenge Commercial Street",
          tin_number: "100987654",
          status: "active",
          subscription_plan: "professional",
        })
        .onConflictDoNothing()
        .returning();

      const [insertedShop3] = await db
        .insert(shops)
        .values({
          name: "Musanze Construction Depot",
          code: "MUSANZE-DEPOT-03",
          owner_name: "Jean Claude Nzeyimana",
          phone: "+250 783 555 777",
          email: "jc@musanzedepot.rw",
          location: "Musanze City Center, Northern Province",
          tin_number: "100456123",
          status: "active",
          subscription_plan: "starter",
        })
        .onConflictDoNothing()
        .returning();

      const shop1Id = insertedShop1 ? insertedShop1.id : 1;
      const shop2Id = insertedShop2 ? insertedShop2.id : 2;

      // 2. Seed Depots / Stocks
      const [stock1] = await db
        .insert(stocks)
        .values({
          shop_id: shop1Id,
          name: "Main Warehouse - Gikondo Yard",
          code: "WH-GIK-01",
          location: "Gikondo Heavy Yard, Kigali",
          manager_name: "Eric Mugisha",
          is_main: 1,
          status: "active",
        })
        .returning();

      const [stock2] = await db
        .insert(stocks)
        .values({
          shop_id: shop1Id,
          name: "Nyabugogo Retail Counter Depot",
          code: "STK-NYA-02",
          location: "Nyabugogo Commercial Center",
          manager_name: "Diane Mukamana",
          is_main: 0,
          status: "active",
        })
        .returning();

      // 3. Seed Users
      // Superadmin rwemera30@gmail.com
      await db
        .insert(users)
        .values({
          shop_id: shop1Id,
          stock_id: stock1?.id || 1,
          name: "Patrick Rwemera (Superadmin)",
          email: "rwemera30@gmail.com",
          password: defaultPasswordHash,
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
        })
        .onConflictDoNothing();

      // Store Manager
      await db
        .insert(users)
        .values({
          shop_id: shop1Id,
          stock_id: stock1?.id || 1,
          name: "Eric Mugisha",
          email: "manager@vectos.rw",
          password: defaultPasswordHash,
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
        })
        .onConflictDoNothing();

      // Cashier
      await db
        .insert(users)
        .values({
          shop_id: shop1Id,
          stock_id: stock2?.id || 2,
          name: "Diane Mukamana",
          email: "cashier@vectos.rw",
          password: defaultPasswordHash,
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
        })
        .onConflictDoNothing();

      console.log("[Seed] Neon Database seeded successfully!");
    } catch (error) {
      console.error("[Seed] Error seeding Neon Database:", error);
    }
  } else {
    console.log("[Seed] In-memory / local fallback mode ready with initial state.");
  }
}

// Run immediately if executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed().then(() => {
    console.log("[Seed] Completed.");
    process.exit(0);
  });
}
