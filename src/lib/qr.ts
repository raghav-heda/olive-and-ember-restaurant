import QRCode from "qrcode";

export interface GenerateQrParams {
  baseUrl: string;
  tableNumber?: string | number;
  utmSource?: string;
}

export async function generateMenuQrCode(params: GenerateQrParams): Promise<{
  dataUrl: string;
  targetUrl: string;
}> {
  const { baseUrl, tableNumber, utmSource = "table_qr" } = params;

  const url = new URL("/menu", baseUrl);
  if (tableNumber) {
    url.searchParams.set("table", String(tableNumber));
  }
  url.searchParams.set("src", utmSource);

  const targetUrl = url.toString();

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
