import { requireAuth, isAdminRole } from "@/lib/auth";
import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { History, ShieldCheck, User } from "lucide-react";
import { ForbiddenCard } from "@/components/admin/ForbiddenCard";

export const revalidate = 0;

export default async function AdminActivityLogsPage() {
  const session = await requireAuth();

  if (!isAdminRole(session.role)) {
    return <ForbiddenCard moduleName="Staff Activity & Security Audit Logs" />;
  }

  const logs = await prisma.activityLog.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Compliance &amp; Audit Trail
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Staff Activity Logs
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Immutable chronological ledger recording menu modifications, reservation state transitions, and operational adjustments.
        </p>
      </div>

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
                  <td colSpan={5} className="text-center py-12 text-ivory-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let parsedDetails = "";
                  try {
                    parsedDetails = log.detailsJson ? JSON.stringify(JSON.parse(log.detailsJson)) : "";
                  } catch {
                    parsedDetails = log.detailsJson || "";
                  }

                  return (
                    <tr key={log.id} className="hover:bg-charcoal-800/40 transition-colors">
                      <td className="p-4 pl-6 font-mono text-[11px] text-ivory-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-ivory-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-terracotta-400" />
                          <span>{log.userName || "System"}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-charcoal-800 text-terracotta-400 border border-charcoal-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-ivory-400">
                        {log.entityType}
                      </td>
                      <td className="p-4 pr-6 font-mono text-[11px] text-ivory-300 max-w-xs truncate">
                        {parsedDetails}
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
