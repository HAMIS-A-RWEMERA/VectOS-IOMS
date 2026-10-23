import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const usersRouter = Router();

// GET /api/users
usersRouter.get(
  "/",
  authMiddleware,
  requirePermission("can_manage_users"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const usersList = await dataStore.getUsers(req.tenantShopId!);
      const sanitized = usersList.map(({ password, ...u }) => u);
      return res.json(sanitized);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to fetch users." });
    }
  }
);

// POST /api/users
usersRouter.post(
  "/",
  authMiddleware,
  requirePermission("can_manage_users"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        email,
        password,
        role,
        job_title,
        phone,
        stock_id,
        can_create_orders,
        can_process_payments,
        can_release_stock,
        can_manage_stock,
        can_view_reports,
        can_give_discounts,
        can_manage_users,
        can_void_orders,
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and temporary password are required." });
      }

      const existing = await dataStore.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      const created = await dataStore.createUser({
        shop_id: req.tenantShopId!,
        stock_id: stock_id ? Number(stock_id) : 1,
        name,
        email,
        password,
        role: role || "cashier",
        job_title: job_title || null,
        phone: phone || null,
        is_active: 1,
        can_create_orders: can_create_orders !== undefined ? (can_create_orders ? 1 : 0) : 1,
        can_process_payments: can_process_payments !== undefined ? (can_process_payments ? 1 : 0) : 1,
        can_release_stock: can_release_stock !== undefined ? (can_release_stock ? 1 : 0) : 0,
        can_manage_stock: can_manage_stock !== undefined ? (can_manage_stock ? 1 : 0) : 0,
        can_view_reports: can_view_reports !== undefined ? (can_view_reports ? 1 : 0) : 1,
        can_give_discounts: can_give_discounts !== undefined ? (can_give_discounts ? 1 : 0) : 0,
        can_manage_users: can_manage_users !== undefined ? (can_manage_users ? 1 : 0) : 0,
        can_void_orders: can_void_orders !== undefined ? (can_void_orders ? 1 : 0) : 0,
      });

      const { password: _, ...sanitized } = created;
      return res.status(201).json(sanitized);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create user." });
    }
  }
);

// PUT /api/users/:id
usersRouter.put(
  "/:id",
  authMiddleware,
  requirePermission("can_manage_users"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dataStore.updateUser(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "User not found." });
      }
      const { password: _, ...sanitized } = updated;
      return res.json(sanitized);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update user." });
    }
  }
);
