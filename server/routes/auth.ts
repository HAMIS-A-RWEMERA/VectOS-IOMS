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

    if (user.is_active === 0) {
      return res.status(403).json({ error: "Your account has been deactivated. Please contact your manager." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please check your email or password." });
    }

    // Get user's shop
    const shop = user.shop_id ? await dataStore.getShopById(user.shop_id) : null;
    const token = signToken(user);

    // Sanitize user object (omit password)
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
    const newShop = await dataStore.createShop({
      name: shopName,
      code,
      owner_name: ownerName,
      email,
      phone,
      location,
      tin_number: tinNumber,
      status: "active",
      subscription_plan: "professional",
    });

    const newUser = await dataStore.createUser({
      shop_id: newShop.id,
      name: ownerName || "Store Owner",
      email,
      password,
      role: "manager",
      job_title: "Store Owner & Managing Director",
      phone,
      is_active: 1,
      can_create_orders: 1,
      can_process_payments: 1,
      can_release_stock: 1,
      can_manage_stock: 1,
      can_view_reports: 1,
      can_give_discounts: 1,
      can_manage_users: 1,
      can_void_orders: 1,
    });

    const token = signToken(newUser);
    const { password: _, ...sanitizedUser } = newUser;

    return res.status(201).json({
      message: "Tenant created successfully.",
      token,
      user: sanitizedUser,
      shop: newShop,
    });
  } catch (error: any) {
    console.error("Register tenant error:", error);
    return res.status(500).json({ error: error.message || "Failed to register tenant." });
  }
});
