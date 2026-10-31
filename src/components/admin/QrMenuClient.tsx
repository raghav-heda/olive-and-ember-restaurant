"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Printer, QrCode, Sparkles, Flame, Check } from "lucide-react";

export function QrMenuClient({
  restaurantName,
  initialQrDataUrl,
  initialTargetUrl,
}: {
  restaurantName: string;
  initialQrDataUrl: string;
  initialTargetUrl: string;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState(initialQrDataUrl);
  const [targetUrl, setTargetUrl] = useState(initialTargetUrl);
  const [loading, setLoading] = useState(false);

  const fetchQr = async (tbl: string) => {
    setLoading(true);
    try {
      const url = tbl ? `/api/qr/generate?table=${encodeURIComponent(tbl)}` : `/api/qr/generate`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.dataUrl) {
        setQrDataUrl(data.dataUrl);
        setTargetUrl(data.targetUrl);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (val: string) => {
    setTableNumber(val);
    fetchQr(val.trim());
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = tableNumber
      ? `olive-ember-qr-table-${tableNumber}.png`
      : `olive-ember-menu-qr.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: QR Configuration & Controls */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-5 text-xs text-ivory-300">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-terracotta-400" />
            <h2 className="font-serif text-lg font-bold text-ivory-50">QR Code Parameters</h2>
          </div>

          <p className="text-ivory-400 leading-relaxed">
            Generate printable contact-free digital menu cards. When guests scan this QR with their mobile camera, the menu opens instantly with pre-configured table parameters.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-ivory-200">
              Table Identifier (Optional)
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => handleTableChange(e.target.value)}
              placeholder="e.g. 1, 4, Patio 2, Booth 6 (Leave blank for general menu)"
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          {/* Target URL Preview */}
          <div className="p-3.5 bg-charcoal-950 border border-charcoal-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-ivory-500 block">
              Destination URL
            </span>
            <span className="font-mono text-[11px] text-terracotta-400 break-all block">
              {targetUrl}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-100 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-colors border border-charcoal-700"
            >
              <Download className="w-4 h-4 text-terracotta-400" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 transition-colors shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Tent</span>
            </button>
          </div>
        </div>

        {/* Operational Best Practices */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 space-y-3 text-xs text-ivory-400">
          <h3 className="font-serif text-sm font-bold text-ivory-100">
            Digital Dine-In Workflows
          </h3>
          <ul className="space-y-2 leading-relaxed">
            <li>• <strong>No App Required:</strong> Guests scan using their default smartphone camera (iOS &amp; Android).</li>
            <li>• <strong>Table Locking:</strong> Table identifiers streamline order routing directly to kitchen display terminals.</li>
            <li>• <strong>Dynamic Updates:</strong> Changing item prices or sold-out statuses in your admin console updates instantly on guests&apos; screens without re-printing paper menus.</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Printable Table Tent Card Mockup */}
      <div className="lg:col-span-7 flex justify-center">
        <div
          id="printable-table-tent"
          className="bg-ivory-100 border-2 border-ivory-300 rounded-3xl p-8 sm:p-12 text-center max-w-sm w-full space-y-6 shadow-2xl text-charcoal-900"
        >
          {/* Brand treatment */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-charcoal-900 text-terracotta-400 flex items-center justify-center mx-auto shadow">
              <Flame className="w-6 h-6 text-terracotta-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-charcoal-900">
              {restaurantName}
            </h2>
            <p className="text-[11px] uppercase tracking-widest text-charcoal-700 font-sans font-medium">
              Wood-Fired Hearth Dining
            </p>
          </div>

          {/* Table Number Pill */}
          {tableNumber && (
            <div className="inline-block px-4 py-1.5 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-900 font-serif font-bold text-sm tracking-wide">
              Table #{tableNumber}
            </div>
          )}

          {/* QR Code Container */}
          <div className="relative p-4 bg-ivory-50 rounded-2xl border-2 border-dashed border-ivory-300 inline-block shadow-inner">
            {qrDataUrl && (
              <Image
                src={qrDataUrl}
                alt="Table Digital Menu QR"
                width={192}
                height={192}
                unoptimized
                className="w-48 h-48 mx-auto object-contain rounded-xl"
              />
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-1.5 text-xs text-charcoal-700 leading-relaxed">
            <p className="font-serif font-bold text-charcoal-900 text-sm">
              Scan to Browse &amp; Order
            </p>
            <p className="text-[11px]">
              Point your smartphone camera at this code to view our 48h sourdough pizzas, daily chef specials, and place table orders.
            </p>
          </div>

          <div className="pt-3 border-t border-ivory-300 text-[10px] text-charcoal-700 uppercase tracking-widest font-mono">
            Direct Kitchen Order System &bull; Fast Service
          </div>
        </div>
      </div>
    </div>
  );
}
