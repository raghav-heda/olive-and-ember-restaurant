import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Valid email address is required"),
  phone: z.string().max(20).optional(),
  subject: z.string().min(3, "Subject is required").max(120),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = contactSchema.parse(body);

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.trim(),
        phone: validated.phone?.trim() || null,
        subject: validated.subject.trim(),
        message: validated.message.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. Our hospitality concierge will respond shortly.",
      inquiryId: inquiry.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid contact inputs" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
