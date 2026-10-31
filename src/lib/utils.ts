import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with Indian Rupee formatting (e.g., ₹1,250)
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  try {
    const validAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(validAmount);
  } catch {
    const fallback = typeof amount === "number" && !isNaN(amount) ? Math.round(amount) : 0;
    return `₹${fallback}`;
  }
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return "—";
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "—";
  }
}
