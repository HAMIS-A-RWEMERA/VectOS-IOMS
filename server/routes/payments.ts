import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

export const paymentsRouter = Router();

// GET /api/payments
paymentsRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dataStore.getPayments(req.tenantShopId!);
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch payments." });
  }
});
