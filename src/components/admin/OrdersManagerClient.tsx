"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  Store,
  UtensilsCrossed,
  XCircle,
  Eye,
  RefreshCw,
  Printer,
  AlertTriangle,
} from "lucide-react";

interface OrderItemOption {
  optionNameSnapshot: string;
  valueNameSnapshot: string;
  priceModifierSnapshot: number;
}

interface OrderItem {
  id: string;
  itemNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  itemTotalSnapshot: number;
  specialInstructions?: string | null;
  options: OrderItemOption[];
}

export interface AdminOrder {
  id: string;
  publicCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  fulfilmentType: string;
  deliveryAddress?: string | null;
  deliveryInstructions?: string | null;
  tableNumber?: string | null;
  status: string;
  cancellationReason?: string | null;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  deliveryFee: number;
  finalTotal: number;
  couponCode?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export function OrdersManagerClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fulfilmentFilter, setFulfilmentFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time synchronization with production database
  const fetchLiveOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (selectedOrder) {
          const freshSelected = data.orders.find((o: AdminOrder) => o.id === selectedOrder.id);
          if (freshSelected) setSelectedOrder(freshSelected);
        }
      }
    } catch {
      // background polling silent fallback
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, [selectedOrder]);

  // Poll database every 4 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchLiveOrders(true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveOrders]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (fulfilmentFilter !== "ALL" && o.fulfilmentType !== fulfilmentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = o.publicCode.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }

    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchLiveOrders(true);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePayment = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
      }
      fetchLiveOrders(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setUpdatingId(cancelModalOrder.id);
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: cancelModalOrder.id,
          status: "CANCELLED",
          cancellationReason: cancelReason || "Cancelled by kitchen staff",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelModalOrder.id
            ? { ...o, status: "CANCELLED", cancellationReason: cancelReason }
            : o
        )
      );
      setCancelModalOrder(null);
      setCancelReason("");
      fetchLiveOrders(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Ribbon */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, guest name, or phone..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ivory-100 placeholder-charcoal-500 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Live Sync Status Pill */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Sync 4s</span>
              </span>

              <button
                type="button"
                onClick={() => fetchLiveOrders(false)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-700 text-xs text-ivory-200 transition-colors shadow-sm"
                title="Immediately refresh kitchen tickets from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-terracotta-400" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-ivory-200 focus:outline-none focus:border-terracotta-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing in Hearth</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={fulfilmentFilter}
              onChange={(e) => setFulfilmentFilter(e.target.value)}
              className="bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-ivory-200 focus:outline-none focus:border-terracotta-500"
            >
              <option value="ALL">All Channels</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
              <option value="DINE_IN">Dine-In Table</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ivory-300">
            <thead className="bg-charcoal-950/80 border-b border-charcoal-800 text-[10px] uppercase tracking-wider text-ivory-400 font-mono">
              <tr>
                <th className="p-4 pl-6">Order Code</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Fulfilment</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Kitchen Status</th>
                <th className="p-4 pr-6 text-right">Quick Progression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ivory-500">
                    No orders matching selected criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-charcoal-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-4 pl-6 font-mono font-bold text-terracotta-400">
                        #{order.publicCode}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-ivory-100">{order.customerName}</p>
                        <p className="text-[10px] text-ivory-400">{order.customerPhone}</p>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-medium text-ivory-200">
                          {order.fulfilmentType.toLowerCase()}
                        </span>
                        {order.tableNumber && (
                          <span className="block text-[10px] text-terracotta-400 font-bold">
                            Table #{order.tableNumber}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-ivory-50 text-sm">
                        {formatCurrency(order.finalTotal)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : order.paymentStatus === "FAILED"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            order.status === "COMPLETED"
                              ? "bg-emerald-950 text-emerald-300"
                              : order.status === "PREPARING"
                              ? "bg-amber-950 text-amber-300"
                              : order.status === "CANCELLED"
                              ? "bg-red-950 text-red-300"
                              : "bg-terracotta-950 text-terracotta-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td
                        className="p-4 pr-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-ivory-50 text-[10px] font-bold uppercase"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                              className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-ivory-50 text-[10px] font-bold uppercase"
                            >
                              Stoke Hearth
                            </button>
                          )}
                          {order.status === "PREPARING" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  order.id,
                                  order.fulfilmentType === "DELIVERY"
                                    ? "OUT_FOR_DELIVERY"
                                    : "READY_FOR_PICKUP"
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-600 text-ivory-50 text-[10px] font-bold uppercase"
                            >
                              Ready
                            </button>
                          )}
                          {["READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(order.status) && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-ivory-50 text-[10px] font-bold uppercase"
                            >
                              Complete
                            </button>
                          )}
                          {!["COMPLETED", "CANCELLED"].includes(order.status) && (
                            <button
                              onClick={() => setCancelModalOrder(order)}
                              className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-red-900/60 text-red-400 text-[10px]"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-ivory-300"
                            title="View receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
          />

          <div className="relative bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-6 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-950">
              <div>
                <span className="font-mono text-xs text-terracotta-400 font-bold">
                  Order Ticket #{selectedOrder.publicCode}
                </span>
                <p className="text-[11px] text-ivory-400 mt-0.5">
                  Placed {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-ivory-400 hover:text-ivory-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                <div>
                  <span className="text-[10px] text-ivory-400 uppercase tracking-wider block">
                    Guest Name
                  </span>
                  <span className="font-bold text-ivory-100 text-sm">
                    {selectedOrder.customerName}
                  </span>
                  <p className="text-[11px] text-ivory-400">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ivory-400 uppercase tracking-wider block">
                    Fulfilment Method
                  </span>
                  <span className="font-bold text-ivory-100 capitalize">
                    {selectedOrder.fulfilmentType.toLowerCase()}
                  </span>
                  {selectedOrder.tableNumber && (
                    <p className="text-terracotta-400 font-bold">
                      Table #{selectedOrder.tableNumber}
                    </p>
                  )}
                  {selectedOrder.deliveryAddress && (
                    <p className="text-[11px] text-ivory-400 line-clamp-2">
                      {selectedOrder.deliveryAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-ivory-50">Ordered Dishes</h4>
                <div className="divide-y divide-charcoal-800 border-y border-charcoal-800">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-ivory-100">
                          {item.quantity}x {item.itemNameSnapshot}
                        </p>
                        {item.options.map((opt, i) => (
                          <p key={i} className="text-[10px] text-ivory-400">
                            • {opt.valueNameSnapshot}
                          </p>
                        ))}
                        {item.specialInstructions && (
                          <p className="text-[10px] text-amber-300 italic">
                            Note: &quot;{item.specialInstructions}&quot;
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-ivory-100">
                        {formatCurrency(item.itemTotalSnapshot)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2 text-xs">
                <div className="flex justify-between text-ivory-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon ({selectedOrder.couponCode}):</span>
                    <span>-{formatCurrency(selectedOrder.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ivory-400">
                  <span>Taxes (5% GST):</span>
                  <span>{formatCurrency(selectedOrder.taxTotal)}</span>
                </div>
                {selectedOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-ivory-400">
                    <span>Delivery Fee:</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-charcoal-800 flex justify-between font-bold text-ivory-50 text-base">
                  <span>Final Total:</span>
                  <span className="text-terracotta-400">{formatCurrency(selectedOrder.finalTotal)}</span>
                </div>
              </div>

              {/* Quick Status Modifiers */}
              <div className="space-y-2">
                <h4 className="font-serif text-xs font-bold text-ivory-300">
                  Kitchen Status Progression:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COMPLETED"].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-colors ${
                          selectedOrder.status === st
                            ? "bg-terracotta-600 text-ivory-50"
                            : "bg-charcoal-950 text-ivory-400 hover:bg-charcoal-800 border border-charcoal-800"
                        }`}
                      >
                        {st.replace(/_/g, " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Payment Status Modifiers */}
              <div className="space-y-2 pt-2 border-t border-charcoal-800">
                <h4 className="font-serif text-xs font-bold text-ivory-300">
                  Payment Status: ({selectedOrder.paymentMethod})
                </h4>
                <div className="flex gap-2">
                  {["UNPAID", "PAID", "REFUNDED"].map((pSt) => (
                    <button
                      key={pSt}
                      onClick={() => handleUpdatePayment(selectedOrder.id, pSt)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-colors ${
                        selectedOrder.paymentStatus === pSt
                          ? "bg-emerald-700 text-ivory-50"
                          : "bg-charcoal-950 text-ivory-400 hover:bg-charcoal-800 border border-charcoal-800"
                      }`}
                    >
                      Mark {pSt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION REASON MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCancelModalOrder(null)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
          />

          <div className="relative bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-serif text-lg font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Cancel Order #{cancelModalOrder.publicCode}</span>
            </h3>
            <p className="text-ivory-300">
              Please enter the operational reason for order cancellation (e.g. ingredient depletion, delivery area unreachable).
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Wood-fired stone oven temperature calibration, refund issued..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-3 text-xs text-ivory-100 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-charcoal-800 text-ivory-300"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-ivory-50 font-bold uppercase"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
