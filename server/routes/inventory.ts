import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const inventoryRouter = Router();

// GET /api/inventory/movements - list audit trail
inventoryRouter.get("/movements", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.query;
    const movements = await dataStore.getMovements(
      req.tenantShopId!,
      productId ? Number(productId) : undefined
    );
    return res.json(movements);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch movements." });
  }
});

// POST /api/inventory/intake - receive stock shipment
inventoryRouter.post(
  "/intake",
  authMiddleware,
  requirePermission("can_manage_stock"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { product_id, quantity, buying_price, selling_price, notes } = req.body;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        return res.status(400).json({ error: "Product ID and valid positive quantity are required." });
      }

      const updatedProduct = await dataStore.recordStockIntake(req.tenantShopId!, {
        product_id: Number(product_id),
        quantity: Number(quantity),
        buying_price: buying_price !== undefined ? Number(buying_price) : undefined,
        selling_price: selling_price !== undefined ? Number(selling_price) : undefined,
        performed_by: req.user!.id,
      });

      return res.status(200).json({
        message: "Stock received successfully.",
        product: updatedProduct,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to process stock intake." });
    }
  }
);

// POST /api/inventory/adjustment - record damage, loss, or manual reconciliation
inventoryRouter.post(
  "/adjustment",
  authMiddleware,
  requirePermission("can_manage_stock"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { product_id, quantity_change, movement_type, notes } = req.body;

      if (!product_id || quantity_change === undefined) {
        return res.status(400).json({ error: "Product ID and quantity change are required." });
      }

      const prod = await dataStore.getProductById(Number(product_id), req.tenantShopId!);
      if (!prod) {
        return res.status(404).json({ error: "Product not found." });
      }

      const newQty = (prod.quantity || 0) + Number(quantity_change);
      if (newQty < 0) {
        return res.status(400).json({ error: "Adjustment cannot result in negative stock quantity." });
      }

      const updated = await dataStore.updateProduct(prod.id, req.tenantShopId!, { quantity: newQty });

      await dataStore.recordMovement({
        shop_id: req.tenantShopId!,
        product_id: prod.id,
        quantity: Number(quantity_change),
        movement_type: movement_type || "Adjustment",
        performed_by: req.user!.id,
      });

      return res.json({
        message: "Stock adjustment recorded.",
        product: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to adjust stock." });
    }
  }
);
