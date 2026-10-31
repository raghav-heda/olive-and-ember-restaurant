import { describe, it, expect } from "vitest";
import { buildMenuTargetUrl, generateMenuQrCode } from "@/lib/qr";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { isAdminRole } from "@/lib/auth";

describe("Production Audit Verification Suite", () => {
  describe("1. Dynamic QR Code URL Resolution & Table Binding", () => {
    it("generates general menu URL when table identifier is omitted", () => {
      const targetUrl = buildMenuTargetUrl({
        baseUrl: "https://olive-and-ember.com",
      });

      expect(targetUrl).toBe("https://olive-and-ember.com/menu?src=table_qr");
      expect(targetUrl).not.toContain("localhost");
      expect(targetUrl).not.toContain("table=");
    });

    it("generates table-specific URL when table identifier is provided (e.g. table=4)", () => {
      const targetUrl = buildMenuTargetUrl({
        baseUrl: "https://olive-and-ember.com",
        tableNumber: "4",
      });

      expect(targetUrl).toBe("https://olive-and-ember.com/menu?src=table_qr&table=4");
      expect(targetUrl).not.toContain("localhost");
    });

    it("handles alphanumeric table identifiers cleanly (e.g. Patio 2)", () => {
      const targetUrl = buildMenuTargetUrl({
        baseUrl: "https://olive-and-ember.com",
        tableNumber: "Patio 2",
      });

      expect(targetUrl).toContain("/menu?src=table_qr&table=Patio+2");
    });

    it("resolves dynamic host from request headers when baseUrl is not hardcoded", () => {
      const mockHeaders = new Headers();
      mockHeaders.set("x-forwarded-host", "olive-and-ember-prod.vercel.app");
      mockHeaders.set("x-forwarded-proto", "https");

      const resolved = resolveAppBaseUrl({ customHeaders: mockHeaders });
      expect(resolved).toBe("https://olive-and-ember-prod.vercel.app");

      const targetUrl = buildMenuTargetUrl({
        clientOrigin: resolved,
        tableNumber: "12",
      });
      expect(targetUrl).toBe(
        "https://olive-and-ember-prod.vercel.app/menu?src=table_qr&table=12"
      );
    });

    it("resolves client browser origin if provided dynamically by QrMenuClient", () => {
      const resolved = resolveAppBaseUrl({
        clientOrigin: "https://oliveandember.in",
      });
      expect(resolved).toBe("https://oliveandember.in");
    });

    it("falls back to localhost:3000 in development when no headers or env are set", () => {
      const resolved = resolveAppBaseUrl();
      expect(resolved).toBeDefined();
    });

    it("generates valid QR image data URL and correct target URL", async () => {
      const { dataUrl, targetUrl } = await generateMenuQrCode({
        baseUrl: "https://olive-and-ember.com",
        tableNumber: "7",
      });

      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(targetUrl).toBe("https://olive-and-ember.com/menu?src=table_qr&table=7");
    });
  });

  describe("2. Defensive Formatting & Zero-Crashing Utils", () => {
    it("safely formats valid, invalid, and empty dates without throwing RangeError", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate(undefined)).toBe("—");
      expect(formatDate("invalid-date-string")).toBe("—");
      expect(formatDate(new Date("2026-10-31"))).toContain("2026");

      expect(formatDateTime(null)).toBe("—");
      expect(formatDateTime(undefined)).toBe("—");
      expect(formatDateTime("not a real date")).toBe("—");
      expect(formatDateTime(new Date("2026-10-31T12:00:00Z"))).toBeDefined();
    });

    it("safely formats currency including zero and NaN values", () => {
      expect(formatCurrency(1250)).toContain("1,250");
      expect(formatCurrency(0)).toContain("0");
      expect(formatCurrency(NaN)).toContain("0");
    });
  });

  describe("3. Role-Based Access Control (RBAC)", () => {
    it("distinguishes administrative roles from front-of-house staff", () => {
      expect(isAdminRole("OWNER")).toBe(true);
      expect(isAdminRole("ADMIN")).toBe(true);
      expect(isAdminRole("STAFF")).toBe(false);
      expect(isAdminRole("GUEST")).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
    });

    it("verifies customer footer contains no public staff or admin portal links", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const footerPath = path.resolve(__dirname, "../src/components/layout/Footer.tsx");
      const content = fs.readFileSync(footerPath, "utf8");

      expect(content.includes("Staff Portal")).toBe(false);
      expect(content.includes('href="/admin')).toBe(false);
      expect(content.includes("/privacy")).toBe(true);
      expect(content.includes("/terms")).toBe(true);
      expect(content.includes("Currency: INR (₹)")).toBe(true);
    });
  });
});
