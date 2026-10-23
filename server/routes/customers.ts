import { Router, Response } from "express";
import { dataStore } from "../db/dataStore";
import { authMiddleware, AuthenticatedRequest, requirePermission } from "../middleware/auth";

export const customersRouter = Router();

// GET /api/customers
customersRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;
    const list = await dataStore.getCustomers(req.tenantShopId!, search ? String(search) : undefined);
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch customers." });
  }
});

// GET /api/customers/:id
customersRouter.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const customer = await dataStore.getCustomerById(id, req.tenantShopId!);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }

    // Also fetch customer orders
    const customerOrders = await dataStore.getOrders(req.tenantShopId!, { customerId: id });

    return res.json({
      ...customer,
      orders: customerOrders,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch customer profile." });
  }
});

// POST /api/customers
customersRouter.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, id_number, email } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Customer or Contractor name is required." });
    }

    const created = await dataStore.createCustomer(req.tenantShopId!, {
      name,
      phone,
      id_number,
      email,
      credit_balance: 0,
    });

    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create customer." });
  }
});

// POST /api/customers/:id/pay-debt - Record debt installment payment
customersRouter.post(
  "/:id/pay-debt",
  authMiddleware,
  requirePermission("can_process_payments"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const customerId = parseInt(req.params.id, 10);
      const { amount, payment_method, reference_no, order_id } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: "Valid payment amount is required." });
      }

      if (!payment_method) {
        return res.status(400).json({ error: "Payment method (cash, momo, bank_transfer) is required." });
      }

      const result = await dataStore.recordDebtPayment(req.tenantShopId!, {
        customer_id: customerId,
        order_id: order_id ? Number(order_id) : null,
        amount: Number(amount),
        payment_method,
        reference_no: reference_no || `REC-${Date.now().toString().slice(-6)}`,
        recorded_by: req.user!.id,
      });

      return res.json({
        message: "Debt payment recorded successfully.",
        payment: result.payment,
        updatedBalance: result.updatedBalance,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to record debt payment." });
    }
  }
);
