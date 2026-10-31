import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "olive_ember_fallback_development_secret_key_8491";
const COOKIE_NAME = "oe_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string;
}

export function isAdminRole(role?: string | null): boolean {
  return role === "ADMIN" || role === "OWNER";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Validates the authenticated session against the database.
 * If allowedRoles is specified, enforces role-based access control.
 * "ADMIN" permissions automatically inherit to "OWNER" accounts.
 * "STAFF" permissions allow both operational staff and administrators.
 */
export async function requireAuth(
  allowedRoles: string[] = ["ADMIN", "OWNER", "STAFF"]
): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Authentication required to access this resource");
  }

  // Normalize allowed roles: if ADMIN is in allowedRoles, OWNER is also permitted
  const normalizedAllowed = new Set(allowedRoles);
  if (normalizedAllowed.has("ADMIN")) {
    normalizedAllowed.add("OWNER");
  }

  // Check role authorization from token
  if (allowedRoles.length > 0 && !normalizedAllowed.has(session.role)) {
    throw new Error("FORBIDDEN: Insufficient permissions for this action");
  }

  // Validate active status and role freshness directly against the database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, isActive: true, role: true, restaurantId: true, name: true, email: true },
  });

  if (!user || !user.isActive) {
    throw new Error("UNAUTHORIZED: Account is deactivated or no longer exists");
  }

  if (allowedRoles.length > 0 && !normalizedAllowed.has(user.role)) {
    throw new Error("FORBIDDEN: User permissions were changed or revoked");
  }

  // Return the fresh verified session details
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
  };
}

/**
 * Server component route protection helper.
 * Validates session and automatically redirects unauthenticated or
 * unauthorized visitors to /admin/login rather than throwing uncaught errors.
 */
export async function requirePageAuth(
  allowedRoles: string[] = ["ADMIN", "OWNER", "STAFF"]
): Promise<SessionPayload> {
  try {
    return await requireAuth(allowedRoles);
  } catch {
    redirect("/admin/login");
  }
}
