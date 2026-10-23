import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const productsRouter = Router();

// GET /api/products
productsRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, lowStock, search } = req.query;
    const prods = await dataStore.getProducts(req.tenantShopId!, {
      category: category ? String(category) : undefined,
      lowStockOnly: lowStock === "true",
      search: search ? String(search) : undefined,
    });
    return res.json(prods);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch products." });
  }
});

// GET /api/products/:id
productsRouter.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const prod = await dataStore.getProductById(id, req.tenantShopId!);
    if (!prod) {
      return res.status(404).json({ error: "Product not found in this store." });
    }
    return res.json(prod);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch product." });
  }
});

// POST /api/products - create product
productsRouter.post(
  "/",
  authMiddleware,
  requirePermission("can_manage_stock"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        sku,
        barcode,
        category,
        unit,
        buying_price,
        selling_price,
        quantity,
        low_stock_threshold,
        description,
        stock_id,
      } = req.body;

      if (!name || buying_price === undefined || selling_price === undefined) {
        return res.status(400).json({ error: "Name, buying price, and selling price are required." });
      }

      const newProduct = await dataStore.createProduct(req.tenantShopId!, {
        name,
        sku,
        barcode,
        category: category || "General",
        unit: unit || "pcs",
        buying_price: Number(buying_price),
        selling_price: Number(selling_price),
        quantity: Number(quantity) || 0,
        low_stock_threshold: Number(low_stock_threshold) || 10,
        description,
        stock_id: stock_id ? Number(stock_id) : 1,
      });

      // Log movement for initial inventory if qty > 0
      if (Number(quantity) > 0) {
        await dataStore.recordMovement({
          shop_id: req.tenantShopId!,
          product_id: newProduct.id,
          quantity: Number(quantity),
          movement_type: "Stock Received",
          performed_by: req.user?.id || null,
        });
      }

      return res.status(201).json(newProduct);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to create product." });
    }
  }
);

// PUT /api/products/:id - update product
productsRouter.put(
  "/:id",
  authMiddleware,
  requirePermission("can_manage_stock"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dataStore.updateProduct(id, req.tenantShopId!, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Product not found." });
      }
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to update product." });
    }
  }
);

// DELETE /api/products/:id
productsRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("can_manage_stock"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await dataStore.deleteProduct(id, req.tenantShopId!);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found or already deleted." });
      }
      return res.json({ message: "Product deleted successfully." });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to delete product." });
    }
  }
);
