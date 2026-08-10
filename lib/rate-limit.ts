import { prisma } from "@/lib/db";

/**
 * USHUS 2026 — Centralised Rate Limiting
 *
 * Uses the existing `RateLimitEntry` Prisma model (PostgreSQL) as a sliding-
 * window store. This is compatible with Vercel's serverless deployment model
 * without requiring an external Redis/Upstash dependency.
 *
 * Limits are configurable via environment variables:
 *   RATE_LIMIT_REGISTER   — max requests per window for /api/v1/auth/register  (default: 10)
 *   RATE_LIMIT_LOGIN      — max requests per window for credentials login        (default: 5)
 *   RATE_LIMIT_REG_POST   — max requests per window for /api/v1/registrations POST (default: 20)
 *   RATE_LIMIT_WINDOW_SEC — sliding window in seconds                           (default: 900 = 15 min)
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const DEFAULT_WINDOW_SEC = parseInt(
  process.env.RATE_LIMIT_WINDOW_SEC ?? "900",
  10
);

export const RateLimits = {
  REGISTER: parseInt(process.env.RATE_LIMIT_REGISTER ?? "10", 10),
  LOGIN: parseInt(process.env.RATE_LIMIT_LOGIN ?? "5", 10),
  REGISTRATION_POST: parseInt(process.env.RATE_LIMIT_REG_POST ?? "20", 10),
} as const;

/**
 * Check and increment the rate limit for a given key.
 *
 * @param key     - Unique identifier for the rate-limit bucket (e.g. `"register:<ip>"`)
 * @param limit   - Max number of requests allowed in the window
 * @param windowSec - Sliding window duration in seconds (default: 900 / 15 min)
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number = DEFAULT_WINDOW_SEC
): Promise<RateLimitResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSec * 1000);

  // Clean up expired entries for this key to keep the table lean
  await prisma.rateLimitEntry.deleteMany({
    where: { key, expiresAt: { lt: now } },
  });

  // Look up the current counter
  const existing = await prisma.rateLimitEntry.findFirst({
    where: { key, expiresAt: { gt: now } },
  });

  if (!existing) {
    // First request in this window — create entry and allow
    await prisma.rateLimitEntry.create({
      data: { key, count: 1, expiresAt },
    });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    // Over limit
    const retryAfterSeconds = Math.ceil(
      (existing.expiresAt.getTime() - now.getTime()) / 1000
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // Under limit — increment
  await prisma.rateLimitEntry.update({
    where: { id: existing.id },
    data: { count: existing.count + 1 },
  });

  return {
    allowed: true,
    remaining: limit - existing.count - 1,
    retryAfterSeconds: 0,
  };
}

/**
 * Helper that returns a ready-made 429 response payload when rate-limited.
 */
export function rateLimitResponse(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
