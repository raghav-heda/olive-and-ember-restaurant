import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  cookieStore.set("oe_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  }

  return NextResponse.json({ success: true });
}
