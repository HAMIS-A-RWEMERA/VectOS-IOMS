import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const ordersRouter = Router();

// GET /api/orders
ordersRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, paymentStatus, limit } = req.query;
    const ordersList = await dataStore.getOrders(req.tenantShopId!, {
      customerId: customerId ? Number(customerId) : undefined,
      paymentStatus: paymentStatus ? String(paymentStatus) : undefined,
      limit: limit ? Number(limit) : 100,
    });
    return res.json(ordersList);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch orders." });
  }
});

// GET /api/orders/:id
ordersRouter.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await dataStore.getOrderById(id, req.tenantShopId!);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    const shop = await dataStore.getShopById(req.tenantShopId!);

    return res.json({
      ...order,
      shop,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch order details." });
  }
});

// POST /api/orders - Process POS Register Order
ordersRouter.post(
  "/",
  authMiddleware,
  requirePermission("can_create_orders"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { items, payment, customer_id, stock_id, notes } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one product item." });
      }

      // Check user permission if discount given (if price lower than standard selling price)
      // Check stock availability
      for (const item of items) {
        const prod = await dataStore.getProductById(item.product_id, req.tenantShopId!);
        if (!prod) {
          return res.status(400).json({ error: `Product ID #${item.product_id} was not found.` });
        }
        if ((prod.quantity || 0) < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for '${prod.name}'. In stock: ${prod.quantity}, Requested: ${item.quantity}`,
          });
        }
      }

      const createdOrder = await dataStore.createOrder(req.tenantShopId!, {
        customer_id: customer_id ? Number(customer_id) : undefined,
        stock_id: stock_id ? Number(stock_id) : undefined,
        salesperson_id: req.user?.id,
        notes,
        items,
        payment,
      });

      const shop = await dataStore.getShopById(req.tenantShopId!);

      return res.status(201).json({
        message: "Order placed successfully.",
        order: createdOrder,
        shop,
      });
    } catch (error: any) {
      console.error("Order creation error:", error);
      return res.status(500).json({ error: error.message || "Failed to process order." });
    }
  }
);
