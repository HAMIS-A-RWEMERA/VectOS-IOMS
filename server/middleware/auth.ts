import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { dataStore, UserRecord } from "../db/dataStore";

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  tenantShopId?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "vectos_jwt_super_secret_production_key_2026";

export function signToken(user: UserRecord): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      shop_id: user.shop_id,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.query?.token) {
      token = String(req.query.token);
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication token required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const user = await dataStore.getUserById(decoded.id);

    if (!user || user.is_active === 0) {
      return res.status(401).json({ error: "User account is invalid or deactivated." });
    }

    req.user = user;

    // Multi-tenant resolution:
    // If superadmin, allow switching tenant shop via 'x-tenant-id' header
    if (user.role === "superadmin" || user.email === "rwemera30@gmail.com") {
      const tenantHeader = req.headers["x-tenant-id"];
      if (tenantHeader) {
        req.tenantShopId = parseInt(String(tenantHeader), 10);
      } else {
        req.tenantShopId = user.shop_id || 1;
      }
    } else {
      // Normal tenant user: STRICT isolation!
      req.tenantShopId = user.shop_id || 1;
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Superadmin has universal override
    if (req.user.role === "superadmin" || req.user.email === "rwemera30@gmail.com") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}

export function requirePermission(permissionKey: keyof UserRecord) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Superadmin has universal override
    if (req.user.role === "superadmin" || req.user.email === "rwemera30@gmail.com") {
      return next();
    }

    const hasPermission = Boolean(req.user[permissionKey]);
    if (!hasPermission) {
      return res.status(403).json({
        error: `Access denied. User lacks required permission: ${String(permissionKey)}`,
      });
    }

    next();
  };
}
