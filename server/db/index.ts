import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

// Configure WebSocket constructor for Neon serverless pool in Node.js environments
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

export let pool: Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;
export let isConnectedToNeon = false;

if (connectionString && connectionString.trim() !== "" && !connectionString.includes("sample_pass")) {
  try {
    pool = new Pool({ connectionString });
    db = drizzle(pool, { schema });
    isConnectedToNeon = true;
    console.log("[DB] Neon Serverless PostgreSQL connection pool initialized with WebSockets.");
  } catch (err) {
    console.error("[DB] Failed to initialize Neon PostgreSQL connection pool:", err);
  }
} else {
  console.log("[DB] No valid DATABASE_URL provided. App will run with internal high-performance mock store with full tenant isolation.");
}

export { schema };
