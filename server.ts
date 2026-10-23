import { app } from "./server/app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// If running in standard Node.js server environment (not Vercel Serverless invocation), start listener
if (process.env.VERCEL !== "1" && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`🚀 [Vectos ERP API] Server running on http://localhost:${PORT}`);
    console.log(`📡 Superadmin Platform Owner: rwemera30@gmail.com`);
  });
}

export default app;
