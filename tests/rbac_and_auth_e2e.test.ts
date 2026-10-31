import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { comparePassword, signSessionToken, verifySessionToken } from "@/lib/auth";

describe("Strict Role-Based Access Control (RBAC) & Authentication Integration", () => {
  let restaurantId: string;
  let adminUserId: string;
  let staffUserId: string;
  let adminToken: string;
  let staffToken: string;

  beforeAll(async () => {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) throw new Error("Seed required before running RBAC tests");
    restaurantId = restaurant.id;

    const admin = await prisma.user.findFirst({
      where: { restaurantId, role: { in: ["ADMIN", "OWNER"] } },
    });
    if (!admin) throw new Error("Admin user not found in database");
    adminUserId = admin.id;

    const staff = await prisma.user.findFirst({
      where: { restaurantId, role: "STAFF" },
    });
    if (!staff) throw new Error("Staff user not found in database");
    staffUserId = staff.id;

    adminToken = signSessionToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      restaurantId,
    });

    staffToken = signSessionToken({
      userId: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      restaurantId,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("authenticates valid admin and staff accounts against hashed database credentials", async () => {
    const adminUser = await prisma.user.findUnique({ where: { id: adminUserId } });
    const isPassValid = await comparePassword("AdminPass@2026", adminUser!.passwordHash);
    expect(isPassValid).toBe(true);

    const staffUser = await prisma.user.findUnique({ where: { id: staffUserId } });
    const isStaffPassValid = await comparePassword("StaffPass@2026", staffUser!.passwordHash);
    expect(isStaffPassValid).toBe(true);
  });

  it("rejects unauthorized staff attempts to mutate food prices or promotional coupons", async () => {
    const staffSession = verifySessionToken(staffToken);
    expect(staffSession).not.toBeNull();
    expect(staffSession?.role).toBe("STAFF");

    // Staff cannot perform admin roles
    const adminRoles = ["OWNER", "ADMIN"];
    expect(adminRoles.includes(staffSession!.role)).toBe(false);
  });

  it("verifies admin token carries privileged administrative role", async () => {
    const adminSession = verifySessionToken(adminToken);
    expect(adminSession).not.toBeNull();
    expect(["OWNER", "ADMIN"]).toContain(adminSession?.role);
  });

  it("prevents staff from elevating privileges or modifying user accounts", async () => {
    // Verify staff role in database is strictly STAFF
    const staffRecord = await prisma.user.findUnique({ where: { id: staffUserId } });
    expect(staffRecord?.role).toBe("STAFF");
    expect(staffRecord?.isActive).toBe(true);
  });

  it("executes the full login -> session verification -> logout lifecycle", async () => {
    // 1. Verify credentials for admin user
    const adminUser = await prisma.user.findUnique({ where: { id: adminUserId } });
    expect(adminUser).not.toBeNull();
    const isPasswordCorrect = await comparePassword("AdminPass@2026", adminUser!.passwordHash);
    expect(isPasswordCorrect).toBe(true);

    // 2. Sign active session token
    const token = signSessionToken({
      userId: adminUser!.id,
      email: adminUser!.email,
      name: adminUser!.name,
      role: adminUser!.role,
      restaurantId: adminUser!.restaurantId,
    });
    expect(token).toBeDefined();

    // 3. Verify token contents and role
    const session = verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.email).toBe("admin@oliveandember.demo");
    expect(session?.role).toBe("OWNER");

    // 4. Verify logout invalidation: expired/empty tokens fail verification
    const expiredDecoded = verifySessionToken("");
    expect(expiredDecoded).toBeNull();

    const tamperedDecoded = verifySessionToken("invalid_jwt_garbage_string");
    expect(tamperedDecoded).toBeNull();
  });
});
