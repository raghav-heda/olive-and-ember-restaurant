import QRCode from "qrcode";
import { resolveAppBaseUrl } from "./app-url";

export interface GenerateQrParams {
  baseUrl?: string;
  tableNumber?: string | number;
  utmSource?: string;
  clientOrigin?: string;
  req?: Request;
}

/**
 * Builds the canonical menu target URL according to production requirements:
 * - If no table identifier is entered: /menu?src=table_qr
 * - If a table identifier is entered: /menu?src=table_qr&table=4
 */
export function buildMenuTargetUrl(params: {
  baseUrl?: string;
  tableNumber?: string | number;
  utmSource?: string;
  clientOrigin?: string;
  req?: Request;
}): string {
  const { baseUrl, tableNumber, utmSource = "table_qr", clientOrigin, req } = params;
  const resolvedBase = baseUrl || resolveAppBaseUrl({ clientOrigin, req });

  const normalizedBase =
    resolvedBase.startsWith("http://") || resolvedBase.startsWith("https://")
      ? resolvedBase
      : `https://${resolvedBase}`;

  const url = new URL("/menu", normalizedBase);
  url.searchParams.set("src", utmSource);

  if (tableNumber !== undefined && tableNumber !== null && String(tableNumber).trim() !== "") {
    url.searchParams.set("table", String(tableNumber).trim());
  }

  return url.toString();
}

export async function generateMenuQrCode(params: GenerateQrParams): Promise<{
  dataUrl: string;
  targetUrl: string;
}> {
  const targetUrl = buildMenuTargetUrl(params);

  const dataUrl = await QRCode.toDataURL(targetUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: "#1C1917",
      light: "#FAF8F5",
    },
    errorCorrectionLevel: "H",
  });

  return {
    dataUrl,
    targetUrl,
  };
}
