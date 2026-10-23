import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, requireRole, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const shopsRouter = Router();

// GET /api/shops - list all shops (Superadmin only)
shopsRouter.get("/", authMiddleware, requireRole("superadmin", "superadmin_support"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allShops = await dataStore.getShops();
    return res.json(allShops);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch shops." });
  }
});

// GET /api/shops/pending - list shops awaiting Superadmin approval
shopsRouter.get(
  "/pending",
  authMiddleware,
  requireRole("superadmin", "superadmin_support"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pending = await dataStore.getPendingShops();
      return res.json(pending);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch pending shops." });
    }
  }
);

// POST /api/shops/:id/approve - Superadmin approves store registration
shopsRouter.post(
  "/:id/approve",
  authMiddleware,
  requireRole("superadmin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targetShopId = parseInt(req.params.id, 10);
      const { notes } = req.body;
      const approved = await dataStore.approveShop(targetShopId, notes);
      if (!approved) {
        return res.status(404).json({ error: "Store not found." });
      }
      return res.json({
        message: `Store '${approved.name}' approved and activated successfully. Owner has been granted access.`,
        shop: approved,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to approve store." });
    }
  }
);

// POST /api/shops/:id/reject - Superadmin rejects store registration
shopsRouter.post(
  "/:id/reject",
  authMiddleware,
  requireRole("superadmin"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targetShopId = parseInt(req.params.id, 10);
      const { reason } = req.body;
      const rejected = await dataStore.rejectShop(targetShopId, reason || "Application rejected by Superadmin");
      if (!rejected) {
        return res.status(404).json({ error: "Store not found." });
      }
      return res.json({
        message: `Store '${rejected.name}' status set to rejected.`,
        shop: rejected,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to reject store." });
    }
  }
);

// GET /api/shops/superadmin/overview - cross-store analytics (Superadmin only)
shopsRouter.get(
  "/superadmin/overview",
  authMiddleware,
  requireRole("superadmin", "superadmin_support"),
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

// PUT /api/shops/settings - edit store tax numbers (TIN), business info, receipt footers (requires can_edit_company_settings)
shopsRouter.put(
  "/settings",
  authMiddleware,
  requirePermission("can_edit_company_settings"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, tin_number, location, phone, receipt_footer } = req.body;
      const updated = await dataStore.updateShop(req.tenantShopId!, {
        name,
        tin_number,
        location,
        phone,
        receipt_footer,
      });
      return res.json({
        message: "Company settings updated successfully.",
        shop: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update company settings." });
    }
  }
);

// POST /api/shops - create new store account directly (Superadmin only)
shopsRouter.post("/", authMiddleware, requireRole("superadmin"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, code, owner_name, phone, email, location, tin_number, subscription_plan, status } = req.body;
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
      status: status || "active", // When SuperAdmin provisions directly, defaults to active
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
    if (req.user?.role !== "superadmin" && req.tenantShopId !== targetShopId) {
      return res.status(403).json({ error: "Unauthorized to update this shop." });
    }

    const updated = await dataStore.updateShop(targetShopId, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update shop." });
  }
});
