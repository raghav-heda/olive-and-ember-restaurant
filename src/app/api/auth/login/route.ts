import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/db";
import { comparePassword, signSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { restaurant: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive account." },
        { status: 401 }
      );
    }

    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Sign JWT session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
    });

    // Set secure HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set("oe_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Record Staff Authentication Activity Log
    try {
      await prisma.activityLog.create({
        data: {
          restaurantId: user.restaurantId,
          userId: user.id,
          userName: user.name,
          action: "AUTH_LOGIN",
          entityType: "UserSession",
          entityId: user.id,
          detailsJson: JSON.stringify({
            email: user.email,
            role: user.role,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (logErr) {
      console.error("Failed to write login activity log:", logErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantName: user.restaurant.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to authenticate" },
      { status: 400 }
    );
  }
}
