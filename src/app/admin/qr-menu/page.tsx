import { requirePageAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateMenuQrCode } from "@/lib/qr";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { QrMenuClient } from "@/components/admin/QrMenuClient";

export const revalidate = 0;

export default async function AdminQrMenuPage() {
  const session = await requirePageAuth();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
  });

  const baseUrl = resolveAppBaseUrl();
  const { dataUrl, targetUrl } = await generateMenuQrCode({
    baseUrl,
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Digital Dining Tech
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          QR-Code Digital Menu Generator
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Generate table-specific QR codes, download print assets, and enable contact-free table ordering.
        </p>
      </div>

      <QrMenuClient
        restaurantName={restaurant?.name || "Olive & Ember Kitchen"}
        initialQrDataUrl={dataUrl}
        initialTargetUrl={targetUrl}
      />
    </div>
  );
}
