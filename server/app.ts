import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { shopsRouter } from "./routes/shops";
import { stocksRouter } from "./routes/stocks";
import { productsRouter } from "./routes/products";
import { customersRouter } from "./routes/customers";
import { ordersRouter } from "./routes/orders";
import { paymentsRouter } from "./routes/payments";
import { inventoryRouter } from "./routes/inventory";
import { reportsRouter } from "./routes/reports";
import { usersRouter } from "./routes/users";

export const app = express();

app.use(cors());
app.use(express.json());

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Vectos ERP Serverless Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRouter);
app.use("/api/shops", shopsRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/products", productsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/users", usersRouter);

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route '${req.originalUrl}' not found.` });
});
