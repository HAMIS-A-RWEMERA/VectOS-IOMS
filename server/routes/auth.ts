import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { dataStore } from "../db/dataStore";
import { signToken, authMiddleware, AuthenticatedRequest } from "../middleware/auth";

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await dataStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please check your email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please check your email or password." });
    }

    const isSuperadmin = user.role === "superadmin" || user.email === "rwemera30@gmail.com";
    const isSupportAgent = user.role === "superadmin_support";

    // Get user's shop
    const shop = user.shop_id ? await dataStore.getShopById(user.shop_id) : null;

    // Check store approval status for normal tenant accounts
    if (!isSuperadmin && !isSupportAgent && shop) {
      if (shop.status === "pending_approval") {
        return res.status(403).json({
          error:
            "Your store registration is currently PENDING APPROVAL by the Platform Superadmin (Patrick Rwemera). You will be granted full access once your store account is verified and activated.",
          status: "pending_approval",
          shopName: shop.name,
        });
      }

      if (shop.status === "rejected") {
        return res.status(403).json({
          error: `Your store application was not approved. Notes: ${shop.approval_notes || "Please contact platform administration."}`,
          status: "rejected",
        });
      }

      if (shop.status === "suspended") {
        return res.status(403).json({
          error: "This store depot account is currently suspended. Please contact platform support.",
          status: "suspended",
        });
      }
    }

    if (user.is_active === 0 && !isSuperadmin) {
      return res.status(403).json({
        error: "Your user account is inactive. Please contact your store manager or platform support.",
      });
    }

    const token = signToken(user);
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      token,
      user: sanitizedUser,
      shop,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "Internal server error during login." });
  }
});

// GET /api/auth/me
authRouter.get("/me", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const shop = req.tenantShopId ? await dataStore.getShopById(req.tenantShopId) : null;
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      user: sanitizedUser,
      shop,
      activeTenantId: req.tenantShopId,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve user profile." });
  }
});

// POST /api/auth/register-tenant
authRouter.post("/register-tenant", async (req, res) => {
  try {
    const {
      shopName,
      shopCode,
      ownerName,
      email,
      phone,
      location,
      tinNumber,
      password,
    } = req.body;

    if (!shopName || !email || !password) {
      return res.status(400).json({ error: "Store name, owner email, and password are required." });
    }

    const existingUser = await dataStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const code = shopCode || `VEC-${Date.now().toString().slice(-4)}`;

    // Create new shop in 'pending_approval' status!
    const newShop = await dataStore.createShop({
      name: shopName,
      code,
      owner_name: ownerName,
      email,
      phone,
      location,
      tin_number: tinNumber,
      status: "pending_approval", // SuperAdmin must approve first!
      subscription_plan: "professional",
      approval_notes: "Newly registered via portal. Pending SuperAdmin review.",
    });

    const newUser = await dataStore.createUser({
      shop_id: newShop.id,
      name: ownerName || "Store Owner",
      email,
      password,
      role: "manager",
      job_title: "Store Owner & Managing Director",
      phone,
      is_active: 0, // Inactive until approved
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
    });

    return res.status(201).json({
      message:
        "Store registration submitted successfully! Your store is now PENDING APPROVAL by the Platform Superadmin (Patrick Rwemera). Once approved, you will be able to log in and manage your depot.",
      status: "pending_approval",
      shop: newShop,
    });
  } catch (error: any) {
    console.error("Register tenant error:", error);
    return res.status(500).json({ error: error.message || "Failed to register tenant." });
  }
});
