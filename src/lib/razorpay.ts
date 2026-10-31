import crypto from "crypto";

export interface CreateRazorpayOrderParams {
  amountInPaisa: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  isSandboxDemo?: boolean;
}

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export function isRazorpayConfigured(): boolean {
  return (
    Boolean(KEY_ID) &&
    Boolean(KEY_SECRET) &&
    !KEY_ID.includes("placeholder") &&
    KEY_ID.startsWith("rzp_")
  );
}

export async function createRazorpayOrder(
  params: CreateRazorpayOrderParams
): Promise<RazorpayOrderResponse> {
  const { amountInPaisa, currency, receipt, notes } = params;

  if (!isRazorpayConfigured()) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: amountInPaisa,
      currency: currency || "INR",
      receipt,
      status: "created",
      isSandboxDemo: true,
    };
  }

  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaisa,
      currency: currency || "INR",
      receipt,
      notes: notes || {},
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Razorpay Order Creation Failed: ${response.status} - ${errorBody}`);
  }

  const orderData = await response.json();
  return {
    id: orderData.id,
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.receipt,
    status: orderData.status,
    isSandboxDemo: false,
  };
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (!isRazorpayConfigured()) {
    return (
      razorpayOrderId.startsWith("order_mock_") &&
      razorpayPaymentId.startsWith("pay_mock_")
    );
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf-8"),
    Buffer.from(razorpaySignature, "utf-8")
  );
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  webhookSignature: string
): boolean {
  if (!WEBHOOK_SECRET || WEBHOOK_SECRET.includes("placeholder")) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(webhookSignature, "utf-8")
  );
}
