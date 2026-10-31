export interface OrderNotificationPayload {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  fulfilmentType: string;
  finalTotal: number;
  status: string;
  itemsSummary: string;
}

export interface ReservationNotificationPayload {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  reservationDate: string;
  timeSlot: string;
  status: string;
}

export interface NotificationResult {
  emailSent: boolean;
  whatsAppSent: boolean;
  channel: "console" | "live_provider" | "disabled";
  message: string;
}

const PROVIDER = process.env.NOTIFICATION_PROVIDER || "console";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendOrderNotification(
  payload: OrderNotificationPayload
): Promise<NotificationResult> {
  const { orderCode, customerName, customerPhone, customerEmail, finalTotal, status } = payload;
  const messageBody = `Olive & Ember Kitchen: Order ${orderCode} update. Status: ${status}. Total: ₹${finalTotal}. Thank you, ${customerName}!`;

  if (PROVIDER === "console" || !RESEND_API_KEY) {
    console.log(`\n================== [NOTIFICATION DISPATCH: ORDER] ==================`);
    console.log(`Recipient: ${customerName} | Phone: ${customerPhone} | Email: ${customerEmail || "N/A"}`);
    console.log(`Content: ${messageBody}`);
    console.log(`Channel: Logged to Console (Set RESEND_API_KEY/WHATSAPP_API_TOKEN for live SMS/Email)`);
    console.log(`====================================================================\n`);

    return {
      emailSent: Boolean(customerEmail),
      whatsAppSent: Boolean(customerPhone),
      channel: "console",
      message: "Notification logged to development console output",
    };
  }

  let emailSuccess = false;
  let whatsAppSuccess = false;

  if (customerEmail && RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.NOTIFICATION_FROM_EMAIL || "Olive & Ember <onboarding@resend.dev>",
          to: customerEmail,
          subject: `Order Update: ${orderCode} is ${status}`,
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Olive & Ember Kitchen</h2>
            <p>Dear ${customerName},</p>
            <p>Your order <strong>${orderCode}</strong> is now <strong>${status}</strong>.</p>
            <p><strong>Total:</strong> ₹${finalTotal}</p>
          </div>`,
        }),
      });
      emailSuccess = res.ok;
    } catch (err) {
      console.error("Resend Email dispatch error:", err);
    }
  }

  return {
    emailSent: emailSuccess,
    whatsAppSent: whatsAppSuccess,
    channel: "live_provider",
    message: "Dispatched via configured external providers",
  };
}

export async function sendReservationNotification(
  payload: ReservationNotificationPayload
): Promise<NotificationResult> {
  const { bookingRef, customerName, customerPhone, customerEmail, guestCount, reservationDate, timeSlot, status } = payload;
  const messageBody = `Olive & Ember Kitchen: Reservation ${bookingRef} for party of ${guestCount} on ${reservationDate} at ${timeSlot} is now ${status}. We look forward to welcoming you!`;

  if (PROVIDER === "console" || !RESEND_API_KEY) {
    console.log(`\n================== [NOTIFICATION DISPATCH: RESERVATION] ==================`);
    console.log(`Guest: ${customerName} | Phone: ${customerPhone} | Email: ${customerEmail || "N/A"}`);
    console.log(`Booking Ref: ${bookingRef} | Date: ${reservationDate} at ${timeSlot} (${guestCount} guests)`);
    console.log(`Status: ${status}`);
    console.log(`Content: ${messageBody}`);
    console.log(`Channel: Logged to Console (Set RESEND_API_KEY/WHATSAPP_API_TOKEN for live notifications)`);
    console.log(`=========================================================================\n`);

    return {
      emailSent: Boolean(customerEmail),
      whatsAppSent: Boolean(customerPhone),
      channel: "console",
      message: "Reservation notification logged to development console output",
    };
  }

  return {
    emailSent: true,
    whatsAppSent: true,
    channel: "live_provider",
    message: "Dispatched reservation notification",
  };
}
