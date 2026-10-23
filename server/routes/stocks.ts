import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const stocksRouter = Router();

// GET /api/stocks - list depots/warehouses for current tenant shop
stocksRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dataStore.getStocks(req.tenantShopId!);
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch depots." });
  }
});

// POST /api/stocks - create new warehouse/depot
stocksRouter.post(
  "/",
  authMiddleware,
  requirePermission("can_manage_stock"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, code, location, manager_name, is_main } = req.body;
      if (!name || !code) {
        return res.status(400).json({ error: "Depot name and code are required." });
      }
      const newStock = await dataStore.createStock(req.tenantShopId!, {
        name,
        code,
        location,
        manager_name,
        is_main: is_main ? 1 : 0,
      });
      return res.status(201).json(newStock);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create depot." });
    }
  }
);
