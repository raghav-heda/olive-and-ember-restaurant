import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  hashPassword,
  comparePassword,
  signSessionToken,
  verifySessionToken,
  SessionPayload,
  isAdminRole,
  requireAuth,
  requirePageAuth,
} from "@/lib/auth";

describe("Security, Hashing & Session Authentication", () => {
  it("securely hashes passwords and prevents plain-text collisions", async () => {
    const password = "SuperSecretPassword@2026";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword("WrongPassword123", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("signs and verifies tamper-proof JWT session tokens", () => {
    const payload: SessionPayload = {
      userId: "user_test_123",
      email: "chef@oliveandember.demo",
      name: "Chef Raghav",
      role: "OWNER",
      restaurantId: "rest_test_456",
    };

    const token = signSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe("OWNER");
    expect(decoded?.restaurantId).toBe("rest_test_456");
  });

  it("rejects tampered or forged JWT tokens", () => {
    const payload: SessionPayload = {
      userId: "user_test_123",
      email: "chef@oliveandember.demo",
      name: "Chef Raghav",
      role: "OWNER",
      restaurantId: "rest_test_456",
    };

    const token = signSessionToken(payload);
    const tamperedToken = token.slice(0, -5) + "ABCDE";

    const decoded = verifySessionToken(tamperedToken);
    expect(decoded).toBeNull();
  });

  it("verifies that the login page contains no quick-fill buttons, demo shortcuts, or hardcoded passwords", () => {
    const loginFilePath = path.resolve(__dirname, "../src/app/admin/login/page.tsx");
    const source = fs.readFileSync(loginFilePath, "utf8");

    // Must not contain quick fill UI
    expect(source.includes("Demo Quick-Fill")).toBe(false);
    expect(source.includes("handleFillAdmin")).toBe(false);
    expect(source.includes("handleFillStaff")).toBe(false);
    expect(source.includes("Owner / Admin")).toBe(false);
    expect(source.includes("Floor Staff")).toBe(false);

    // Must not contain default passwords in source code
    expect(source.includes("AdminPass@2026")).toBe(false);
    expect(source.includes("StaffPass@2026")).toBe(false);

    // Must initialize with empty strings
    expect(source.includes('useState("")')).toBe(true);
  });

  it("isAdminRole correctly identifies privileged roles and distinguishes staff", () => {
    expect(isAdminRole("OWNER")).toBe(true);
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("STAFF")).toBe(false);
    expect(isAdminRole("GUEST")).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });

  it("requireAuth throws UNAUTHORIZED when no session cookie exists", async () => {
    await expect(requireAuth()).rejects.toThrow(/UNAUTHORIZED/i);
  });

  it("requirePageAuth cleanly redirects to /admin/login when no session cookie exists", async () => {
    try {
      await requirePageAuth();
      expect.fail("Expected requirePageAuth to redirect");
    } catch (err: any) {
      expect(err.message).toMatch(/NEXT_REDIRECT/i);
    }
  });
});
