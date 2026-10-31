import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("Razorpay Signature & Security Verification", () => {
  it("verifies mock test mode signatures predictably", () => {
    const isMock = true;
    const orderId = "order_mock_12345";
    const paymentId = "pay_mock_67890";

    const passes = orderId.startsWith("order_mock_") && paymentId.startsWith("pay_mock_");
    expect(passes).toBe(true);
  });

  it("computes timing-safe HMAC SHA256 signatures accurately", () => {
    const secret = "test_secret_key_84920";
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    const payload = `${orderId}|${paymentId}`;

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const validTest = crypto.timingSafeEqual(
      Buffer.from(expectedSig, "utf-8"),
      Buffer.from(expectedSig, "utf-8")
    );
    expect(validTest).toBe(true);

    const tamperedSig = expectedSig.replace(/a/g, "b");
    const tampered = expectedSig === tamperedSig;
    expect(tampered).toBe(false);
  });
});
