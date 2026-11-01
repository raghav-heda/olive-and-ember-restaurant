"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UtensilsCrossed,
  RefreshCw,
} from "lucide-react";

export interface AdminReservation {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  reservationDate: string;
  timeSlot: string;
  tableAssignment?: string | null;
  specialRequests?: string | null;
  status: string;
  staffNotes?: string | null;
  createdAt: string;
}

export function ReservationsManagerClient({
  initialReservations,
}: {
  initialReservations: AdminReservation[];
}) {
  const [reservations, setReservations] = useState<AdminReservation[]>(initialReservations);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRes, setSelectedRes] = useState<AdminReservation | null>(null);
  const [tableInput, setTableInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  // Real-time synchronization with production database
  const fetchLiveReservations = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/reservations", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.reservations)) {
        setReservations(data.reservations);
        setLastSyncedAt(new Date());
      }
    } catch {
      // background polling silent fallback
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Poll database every 4 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchLiveReservations(true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveReservations]);

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchPhone = r.customerPhone.toLowerCase().includes(q);
      const matchRef = r.bookingRef.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchRef) return false;
    }
    return true;
  });

  const handleUpdate = async (resId: string, status?: string, table?: string, notes?: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/reservations/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: resId,
          status,
          tableAssignment: table,
          staffNotes: notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReservations((prev) =>
        prev.map((r) =>
          r.id === resId
            ? {
                ...r,
                status: status || r.status,
                tableAssignment: table !== undefined ? table : r.tableAssignment,
                staffNotes: notes !== undefined ? notes : r.staffNotes,
              }
            : r
        )
      );

      if (selectedRes && selectedRes.id === resId) {
        setSelectedRes((prev) =>
          prev
            ? {
                ...prev,
                status: status || prev.status,
                tableAssignment: table !== undefined ? table : prev.tableAssignment,
                staffNotes: notes !== undefined ? notes : prev.staffNotes,
              }
            : null
        );
      }

      // Re-sync with database to ensure perfect consistency
      fetchLiveReservations(true);
    } catch (err: any) {
      alert(err.message || "Failed to update reservation");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDetail = (r: AdminReservation) => {
    setSelectedRes(r);
    setTableInput(r.tableAssignment || "");
    setNotesInput(r.staffNotes || "");
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ref, guest name, or phone..."
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
              onClick={() => fetchLiveReservations(false)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-700 text-xs text-ivory-200 transition-colors shadow-sm"
              title="Immediately refresh table bookings from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-terracotta-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-ivory-200 focus:outline-none focus:border-terracotta-500 w-full sm:w-auto"
          >
            <option value="ALL">All Reservation Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SEATED">Seated at Table</option>
            <option value="COMPLETED">Completed Service</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ivory-300">
            <thead className="bg-charcoal-950/80 border-b border-charcoal-800 text-[10px] uppercase tracking-wider text-ivory-400 font-mono">
              <tr>
                <th className="p-4 pl-6">Reference</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Date &amp; Slot</th>
                <th className="p-4">Party Size</th>
                <th className="p-4">Table</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ivory-500">
                    No reservations matching current filters
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-charcoal-800/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(r)}
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-terracotta-400">
                      #{r.bookingRef}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-ivory-100">{r.customerName}</p>
                      <p className="text-[10px] text-ivory-400">{r.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-ivory-200">{r.reservationDate}</p>
                      <p className="text-[10px] text-terracotta-400 font-mono font-bold">
                        {r.timeSlot}
                      </p>
                    </td>
                    <td className="p-4 font-bold text-ivory-50">
                      {r.guestCount} Guests
                    </td>
                    <td className="p-4 text-ivory-300">
                      {r.tableAssignment || (
                        <span className="text-[10px] text-ivory-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          r.status === "CONFIRMED"
                            ? "bg-emerald-950 text-emerald-400"
                            : r.status === "SEATED"
                            ? "bg-blue-950 text-blue-400"
                            : r.status === "COMPLETED"
                            ? "bg-gray-800 text-gray-400"
                            : r.status === "CANCELLED"
                            ? "bg-red-950 text-red-400"
                            : "bg-amber-950 text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td
                      className="p-4 pr-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdate(r.id, "CONFIRMED")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-ivory-50 text-[10px] font-bold uppercase"
                          >
                            Approve
                          </button>
                        )}
                        {r.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleUpdate(r.id, "SEATED")}
                            className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-600 text-ivory-50 text-[10px] font-bold uppercase"
                          >
                            Seat
                          </button>
                        )}
                        {r.status === "SEATED" && (
                          <button
                            onClick={() => handleUpdate(r.id, "COMPLETED")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-ivory-50 text-[10px] font-bold uppercase"
                          >
                            Complete
                          </button>
                        )}
                        {!["COMPLETED", "CANCELLED"].includes(r.status) && (
                          <button
                            onClick={() => handleUpdate(r.id, "CANCELLED")}
                            className="px-2 py-1 rounded-lg bg-charcoal-800 hover:bg-red-900/60 text-red-400 text-[10px]"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedRes(null)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
          />

          <div className="relative bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
              <div>
                <span className="font-mono text-terracotta-400 font-bold text-xs">
                  Booking Reference #{selectedRes.bookingRef}
                </span>
                <h3 className="font-serif text-xl font-bold text-ivory-50 mt-0.5">
                  {selectedRes.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="text-ivory-400 hover:text-ivory-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
              <div>
                <span className="text-[10px] text-ivory-400 block uppercase">Phone</span>
                <span className="font-semibold text-ivory-100">{selectedRes.customerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-ivory-400 block uppercase">Email</span>
                <span className="font-semibold text-ivory-100">
                  {selectedRes.customerEmail || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ivory-400 block uppercase">Date &amp; Slot</span>
                <span className="font-bold text-terracotta-400">
                  {selectedRes.reservationDate} at {selectedRes.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ivory-400 block uppercase">Party Size</span>
                <span className="font-bold text-ivory-100">{selectedRes.guestCount} Guests</span>
              </div>
            </div>

            {selectedRes.specialRequests && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-200">
                <span className="font-bold block text-[10px] uppercase tracking-wider mb-1">
                  Special Requests / Allergies
                </span>
                <p className="text-xs">&quot;{selectedRes.specialRequests}&quot;</p>
              </div>
            )}

            {/* Table Assignment & Notes Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Table / Booth Assignment
                </label>
                <input
                  type="text"
                  value={tableInput}
                  onChange={(e) => setTableInput(e.target.value)}
                  placeholder="e.g. Hearth Booth 3, Terrace Table 12..."
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Internal Staff Notes
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. VIP regular, anniversary dessert requested..."
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-charcoal-800">
              <div className="flex gap-1.5">
                {["CONFIRMED", "SEATED", "COMPLETED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdate(selectedRes.id, st, tableInput, notesInput)}
                    className="px-2.5 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 text-[10px] font-bold uppercase"
                  >
                    Mark {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleUpdate(selectedRes.id, undefined, tableInput, notesInput)}
                disabled={updating}
                className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
