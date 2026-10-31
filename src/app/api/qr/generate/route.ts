import { NextResponse } from "next/server";
import { generateMenuQrCode } from "@/lib/qr";
import { resolveAppBaseUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get("table") || undefined;
    const originParam = searchParams.get("origin") || undefined;

    const baseUrl = resolveAppBaseUrl({
      req,
      clientOrigin: originParam,
    });

    const { dataUrl, targetUrl } = await generateMenuQrCode({
      baseUrl,
      tableNumber,
    });

    return NextResponse.json({
      dataUrl,
      targetUrl,
      tableNumber: tableNumber || null,
      baseUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
