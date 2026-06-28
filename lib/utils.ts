import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  addHours,
  differenceInHours,
} from "date-fns";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "MMM dd, yyyy"
): string {
  return format(new Date(date), formatStr);
}

/**
 * Format a date to a readable date-time string
 */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy 'at' hh:mm a");
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Check if a date is overdue (past the current time)
 */
export function isOverdue(date: Date | string): boolean {
  return isBefore(new Date(date), new Date());
}

/**
 * Check if a due date is within the next N hours
 */
export function isDueSoon(date: Date | string, hours: number = 48): boolean {
  const dueDate = new Date(date);
  const now = new Date();
  return isAfter(dueDate, now) && isBefore(dueDate, addHours(now, hours));
}

/**
 * Get hours until a due date
 */
export function hoursUntilDue(date: Date | string): number {
  return differenceInHours(new Date(date), new Date());
}

/**
 * Generate a confirmation code for registrations
 */
export function generateConfirmationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "USHUS-2026-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format currency in INR
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON without throwing
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
