import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, requireRole, AuthenticatedRequest } from "../middleware/auth";

export const shopsRouter = Router();

// GET /api/shops - list all shops (Superadmin only)
shopsRouter.get("/", authMiddleware, requireRole("superadmin"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allShops = await dataStore.getShops();
    return res.json(allShops);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch shops." });
  }
});

// GET /api/shops/superadmin/overview - cross-store analytics (Superadmin only)
shopsRouter.get(
  "/superadmin/overview",
  authMiddleware,
  requireRole("superadmin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = await dataStore.getSuperadminStats();
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch superadmin stats." });
    }
  }
);

// GET /api/shops/current - get current active tenant shop details
shopsRouter.get("/current", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shop = await dataStore.getShopById(req.tenantShopId!);
    if (!shop) {
      return res.status(404).json({ error: "Tenant shop not found." });
    }
    return res.json(shop);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch current shop." });
  }
});

// POST /api/shops - create new store account (Superadmin only)
shopsRouter.post("/", authMiddleware, requireRole("superadmin"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, code, owner_name, phone, email, location, tin_number, subscription_plan } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: "Shop name and unique code are required." });
    }
    const newShop = await dataStore.createShop({
      name,
      code,
      owner_name,
      phone,
      email,
      location,
      tin_number,
      subscription_plan: subscription_plan || "enterprise",
    });
    return res.status(201).json(newShop);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create shop." });
  }
});

// PUT /api/shops/:id - update shop details / status / subscription
shopsRouter.put("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetShopId = parseInt(req.params.id, 10);
    // Only superadmin or manager of that specific shop can update
    if (req.user?.role !== "superadmin" && req.tenantShopId !== targetShopId) {
      return res.status(403).json({ error: "Unauthorized to update this shop." });
    }

    const updated = await dataStore.updateShop(targetShopId, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update shop." });
  }
});
