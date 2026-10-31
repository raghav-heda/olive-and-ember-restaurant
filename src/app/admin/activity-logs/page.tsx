import { requirePageAuth, isAdminRole } from "@/lib/auth";
import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { History, ShieldCheck, User, Sparkles, Filter } from "lucide-react";

export const revalidate = 0;

export default async function AdminActivityLogsPage() {
  const session = await requirePageAuth();
  const isAdmin = isAdminRole(session.role);

  // Role-based visibility:
  // - Admins/Owners see complete audit trail (promotions, financial settings, all staff actions)
  // - Staff see operational logs (orders, reservations, menu updates, and session logins)
  const whereClause: any = {
    restaurantId: session.restaurantId,
  };

  if (!isAdmin) {
    whereClause.entityType = {
      in: ["ORDER", "RESERVATION", "MENU_ITEM", "UserSession"],
    };
  }

  let logs: any[] = [];
  let queryError: string | null = null;

  try {
    logs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err: any) {
    console.error("Failed to query activity logs:", err);
    queryError = err?.message || "Failed to load audit logs from database.";
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
              Compliance &amp; Operational Ledger
            </span>
            <span className="text-xs text-charcoal-700">&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-charcoal-900 text-ivory-300 border border-charcoal-800 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-terracotta-400" />
              <span>{isAdmin ? "Admin View: Complete Audit Trail" : "Staff View: Operations Stream"}</span>
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
            Staff Activity Logs
          </h1>
          <p className="text-xs text-ivory-400 mt-1">
            Chronological ledger recording table reservations, order state transitions, menu updates, and staff authentication sessions.
          </p>
        </div>
      </div>

      {queryError && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs">
          Notice: {queryError}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ivory-300">
            <thead className="bg-charcoal-950/80 border-b border-charcoal-800 text-[10px] uppercase tracking-wider text-ivory-400 font-mono">
              <tr>
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Staff Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4 pr-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/80">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 px-4 text-center">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-charcoal-950 border border-charcoal-800 flex items-center justify-center mx-auto text-terracotta-400">
                        <History className="w-6 h-6" />
                      </div>
                      <p className="font-serif font-bold text-ivory-100 text-base">
                        No Activity Logs Recorded Yet
                      </p>
                      <p className="text-xs text-ivory-500 leading-relaxed">
                        Operational actions such as logging in, updating live order tickets, modifying reservations, or altering menu items will be automatically audited here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let formattedDetails = "";
                  try {
                    if (log.detailsJson) {
                      const parsed = JSON.parse(log.detailsJson);
                      formattedDetails = Object.entries(parsed)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" • ");
                    }
                  } catch {
                    formattedDetails = log.detailsJson || "";
                  }

                  return (
                    <tr key={log.id} className="hover:bg-charcoal-800/40 transition-colors">
                      <td className="p-4 pl-6 font-mono text-[11px] text-ivory-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-semibold text-ivory-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-terracotta-400" />
                          <span>{log.userName || "System"}</span>
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            log.action.includes("AUTH")
                              ? "bg-blue-950/60 text-blue-300 border-blue-800"
                              : log.action.includes("ORDER")
                              ? "bg-terracotta-950/60 text-terracotta-300 border-terracotta-800"
                              : log.action.includes("RESERVATION")
                              ? "bg-amber-950/60 text-amber-300 border-amber-800"
                              : "bg-charcoal-800 text-ivory-200 border-charcoal-700"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-ivory-400 whitespace-nowrap">
                        {log.entityType}
                      </td>
                      <td className="p-4 pr-6 text-[11px] text-ivory-300 max-w-md truncate">
                        {formattedDetails || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
