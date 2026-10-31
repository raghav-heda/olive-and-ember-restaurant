import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

async function logLogoutActivity() {
  try {
    const session = await getCurrentSession();
    if (session) {
      await prisma.activityLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: "AUTH_LOGOUT",
          entityType: "UserSession",
          entityId: session.userId,
          detailsJson: JSON.stringify({
            email: session.email,
            role: session.role,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }
  } catch (err) {
    console.error("Failed to write logout activity log:", err);
  }
}

export async function POST(req: Request) {
  await logLogoutActivity();

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
  await logLogoutActivity();

  const cookieStore = cookies();
  cookieStore.set("oe_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.redirect(new URL("/admin/login", req.url), 303);
}
