"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  Mail,
  MailOpen,
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export interface ContactInquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

export function InquiriesManagerClient({
  initialInquiries,
}: {
  initialInquiries: ContactInquiryItem[];
}) {
  const [inquiries, setInquiries] = useState<ContactInquiryItem[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryItem | null>(null);

  const handleToggleRead = async (inquiry: ContactInquiryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUpdatingId(inquiry.id);
    try {
      const res = await fetch("/api/admin/inquiries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          isRead: !inquiry.isRead,
        }),
      });

      if (res.ok) {
        const nextState = !inquiry.isRead;
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiry.id ? { ...i, isRead: nextState } : i))
        );
        if (selectedInquiry?.id === inquiry.id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, isRead: nextState } : null));
        }
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = inquiries.filter((item) => {
    if (filter === "unread" && item.isRead) return false;
    if (filter === "read" && !item.isRead) return false;

    if (search.trim()) {
      const query = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchEmail = item.email.toLowerCase().includes(query);
      const matchSub = item.subject.toLowerCase().includes(query);
      const matchMsg = item.message.toLowerCase().includes(query);
      return matchName || matchEmail || matchSub || matchMsg;
    }
    return true;
  });

  const unreadCount = inquiries.filter((i) => !i.isRead).length;

  return (
    <div className="space-y-6">
      {/* Search, Filter & Stats Toolbar */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sender, email, subject, or message..."
              className="w-full bg-charcoal-950 border border-charcoal-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ivory-100 placeholder-ivory-600 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === "all"
                  ? "bg-charcoal-800 text-ivory-50 border border-charcoal-700"
                  : "text-ivory-400 hover:text-ivory-200"
              }`}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filter === "unread"
                  ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                  : "text-ivory-400 hover:text-ivory-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Unread ({unreadCount})</span>
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === "read"
                  ? "bg-charcoal-800 text-ivory-50 border border-charcoal-700"
                  : "text-ivory-400 hover:text-ivory-200"
              }`}
            >
              Archived / Read ({inquiries.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Inquiries Table / List */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ivory-300">
            <thead className="bg-charcoal-950 text-ivory-400 font-mono text-[10px] uppercase tracking-wider border-b border-charcoal-800">
              <tr>
                <th className="p-4 pl-6">Status</th>
                <th className="p-4">Sender</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Preview</th>
                <th className="p-4">Received</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/70">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-ivory-500">
                    No guest inquiries matching the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedInquiry(item)}
                    className={`hover:bg-charcoal-800/50 transition-colors cursor-pointer ${
                      !item.isRead ? "bg-amber-950/20 font-medium" : ""
                    }`}
                  >
                    <td className="p-4 pl-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.isRead
                            ? "bg-charcoal-800 text-ivory-400"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {item.isRead ? <MailOpen className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                        <span>{item.isRead ? "Read" : "New"}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-ivory-100">{item.name}</p>
                      <p className="text-[11px] text-ivory-400">{item.email}</p>
                      {item.phone && (
                        <p className="text-[10px] text-ivory-500">{item.phone}</p>
                      )}
                    </td>
                    <td className="p-4 font-bold text-ivory-100 max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="p-4 text-ivory-400 max-w-sm truncate text-[11px]">
                      {item.message}
                    </td>
                    <td className="p-4 text-[11px] text-ivory-400 whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td
                      className="p-4 pr-6 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleToggleRead(item, e)}
                        disabled={updatingId === item.id}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                          item.isRead
                            ? "bg-charcoal-800 hover:bg-charcoal-700 text-ivory-300"
                            : "bg-amber-700 hover:bg-amber-600 text-ivory-50 shadow-sm"
                        }`}
                      >
                        {item.isRead ? "Mark Unread" : "Mark as Read"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedInquiry(null)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
          />

          <div className="relative bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
              <div>
                <span className="font-mono text-terracotta-400 font-bold text-[11px] uppercase tracking-wider">
                  Guest Hospitality Note
                </span>
                <h3 className="font-serif text-xl font-bold text-ivory-50 mt-0.5">
                  {selectedInquiry.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-ivory-400 hover:text-ivory-100 text-base"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
              <div>
                <span className="text-[10px] text-ivory-500 uppercase block font-bold">Guest Name</span>
                <p className="font-semibold text-ivory-100 mt-0.5">{selectedInquiry.name}</p>
              </div>
              <div>
                <span className="text-[10px] text-ivory-500 uppercase block font-bold">Email</span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-semibold text-terracotta-400 hover:underline mt-0.5 block truncate"
                >
                  {selectedInquiry.email}
                </a>
              </div>
              {selectedInquiry.phone && (
                <div>
                  <span className="text-[10px] text-ivory-500 uppercase block font-bold">Phone</span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-semibold text-ivory-200 hover:underline mt-0.5 block"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>
              )}
              <div>
                <span className="text-[10px] text-ivory-500 uppercase block font-bold">Received</span>
                <p className="text-ivory-300 mt-0.5">{formatDateTime(selectedInquiry.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-ivory-500 uppercase block font-bold tracking-wider">
                Full Inquiry Message
              </span>
              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-ivory-200 leading-relaxed text-xs whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-charcoal-800">
              <button
                onClick={() => handleToggleRead(selectedInquiry)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  selectedInquiry.isRead
                    ? "bg-charcoal-800 hover:bg-charcoal-700 text-ivory-300"
                    : "bg-emerald-700 hover:bg-emerald-600 text-ivory-50 shadow-sm"
                }`}
              >
                {selectedInquiry.isRead ? "Mark as Unread" : "Mark as Read"}
              </button>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
