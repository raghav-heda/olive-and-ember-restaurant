import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const updateInquirySchema = z.object({
  inquiryId: z.string().min(1),
  isRead: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["ADMIN", "OWNER", "STAFF"], req);
    const body = await req.json();
    const validated = updateInquirySchema.parse(body);

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id: validated.inquiryId },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry record not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.contactInquiry.update({
      where: { id: inquiry.id },
      data: { isRead: validated.isRead },
    });

    // Record activity log
    try {
      await prisma.activityLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: "INQUIRY_STATUS_UPDATED",
          entityType: "ContactInquiry",
          entityId: updated.id,
          detailsJson: JSON.stringify({
            inquiryId: updated.id,
            subject: updated.subject,
            isRead: updated.isRead,
            updatedBy: session.name,
          }),
        },
      });
    } catch (logErr) {
      console.warn("Could not write activity log for inquiry update:", logErr);
    }

    return NextResponse.json({
      success: true,
      inquiry: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid inputs" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
