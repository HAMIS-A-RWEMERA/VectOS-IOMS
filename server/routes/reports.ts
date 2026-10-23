import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const reportsRouter = Router();

// GET /api/reports/dashboard
reportsRouter.get(
  "/dashboard",
  authMiddleware,
  requirePermission("can_view_reports"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reports = await dataStore.getReports(req.tenantShopId!);
      return res.json(reports);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to generate reports." });
    }
  }
);
