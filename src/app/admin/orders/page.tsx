import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { OrdersManagerClient, AdminOrder } from "@/components/admin/OrdersManagerClient";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const session = await requireAuth();

  const rawOrders = await prisma.order.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          options: true,
        },
      },
    },
  });

  const orders: AdminOrder[] = rawOrders.map((o) => ({
    id: o.id,
    publicCode: o.publicCode,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    fulfilmentType: o.fulfilmentType,
    deliveryAddress: o.deliveryAddress,
    deliveryInstructions: o.deliveryInstructions,
    tableNumber: o.tableNumber,
    status: o.status,
    cancellationReason: o.cancellationReason,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    discountTotal: o.discountTotal,
    taxTotal: o.taxTotal,
    deliveryFee: o.deliveryFee,
    finalTotal: o.finalTotal,
    couponCode: o.couponCode,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      itemNameSnapshot: i.itemNameSnapshot,
      unitPriceSnapshot: i.unitPriceSnapshot,
      quantity: i.quantity,
      itemTotalSnapshot: i.itemTotalSnapshot,
      specialInstructions: i.specialInstructions,
      options: i.options.map((opt) => ({
        optionNameSnapshot: opt.optionNameSnapshot,
        valueNameSnapshot: opt.valueNameSnapshot,
        priceModifierSnapshot: opt.priceModifierSnapshot,
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Kitchen Dispatch &amp; Fulfilment
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Live Order Management
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Review inbound tickets, advance cooking states, monitor payments, and dispatch notifications.
        </p>
      </div>

      <OrdersManagerClient initialOrders={orders} />
    </div>
  );
}
