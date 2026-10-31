import { NextResponse } from "next/server";
import { generateMenuQrCode } from "@/lib/qr";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get("table") || undefined;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { dataUrl, targetUrl } = await generateMenuQrCode({
      baseUrl,
      tableNumber,
    });

    return NextResponse.json({
      dataUrl,
      targetUrl,
      tableNumber,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
