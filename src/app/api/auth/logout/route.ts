import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cookieStore = cookies();
  cookieStore.set("oe_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  const accept = req.headers.get("accept") || "";
  const secFetchMode = req.headers.get("sec-fetch-mode") || "";
  if (accept.includes("text/html") || secFetchMode === "navigate") {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const cookieStore = cookies();
  cookieStore.set("oe_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.redirect(new URL("/admin/login", req.url), 303);
}
