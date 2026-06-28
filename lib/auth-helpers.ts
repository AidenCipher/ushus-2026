import { randomBytes } from "crypto";

/**
 * Generate a cryptographically secure 32-byte hex token (64 characters)
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Check if a token's expiry timestamp is in the past
 */
export function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate.getTime() < Date.now();
}
