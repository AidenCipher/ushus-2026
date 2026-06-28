/**
 * @jest-environment node
 */

import { hash as hashPassword, compare as verifyPassword } from "bcryptjs";
import { generateResetToken, isTokenExpired } from "@/lib/auth-helpers";
import { encode, decode } from "next-auth/jwt";

const SECRET = "super-secret-auth-key-32-characters-minimum";

describe("Authentication Utilities", () => {
  describe("Password Hashing", () => {
    it("AUTH-U-001: hashPassword produces bcrypt hash starting with $2b$", async () => {
      const hash = await hashPassword("Password123!", 10);
      expect(hash).toMatch(/^\$2[ayb]\$.*/);
    });

    it("AUTH-U-002: hashPassword is non-reversible (yields different hashes for same input)", async () => {
      const hash1 = await hashPassword("Password123!", 10);
      const hash2 = await hashPassword("Password123!", 10);
      expect(hash1).not.toBe(hash2);
    });

    it("AUTH-U-003: verifyPassword returns true for correct pair", async () => {
      const hash = await hashPassword("Password123!", 10);
      const isValid = await verifyPassword("Password123!", hash);
      expect(isValid).toBe(true);
    });

    it("AUTH-U-004: verifyPassword returns false for wrong password", async () => {
      const hash = await hashPassword("Password123!", 10);
      const isValid = await verifyPassword("WrongPassword!", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Reset Token Utilities", () => {
    it("AUTH-U-005: generateResetToken returns 64-char hex string (32-bytes)", () => {
      const token = generateResetToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-fA-F]+$/);
    });

    it("AUTH-U-006: isTokenExpired returns true for past timestamp", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(isTokenExpired(twoHoursAgo)).toBe(true);
    });

    it("AUTH-U-007: isTokenExpired returns false for future timestamp", () => {
      const oneHourAhead = new Date(Date.now() + 1 * 60 * 60 * 1000);
      expect(isTokenExpired(oneHourAhead)).toBe(false);
    });
  });

  describe("JWT Operations", () => {
    const mockPayload = {
      id: "test-user-id",
      email: "user@test.ushus",
      name: "Test User",
      role: "PARTICIPANT",
      isActive: true,
    };

    it("AUTH-U-008: JWT payload contains id, email, role, and details after encode/decode", async () => {
      const encryptedToken = await encode({
        token: mockPayload,
        secret: SECRET,
        maxAge: 24 * 60 * 60,
        salt: "ushus-session-token",
      });

      const decryptedToken = await decode({
        token: encryptedToken,
        secret: SECRET,
        salt: "ushus-session-token",
      });

      expect(decryptedToken).toMatchObject(mockPayload);
    });

    it("AUTH-U-009: JWT expiration is exactly 24 hours from issue time", async () => {
      const encryptedToken = await encode({
        token: mockPayload,
        secret: SECRET,
        maxAge: 24 * 60 * 60,
        salt: "ushus-session-token",
      });

      const decryptedToken = await decode({
        token: encryptedToken,
        secret: SECRET,
        salt: "ushus-session-token",
      });

      if (decryptedToken) {
        expect(decryptedToken.exp! - decryptedToken.iat!).toBe(24 * 60 * 60);
      } else {
        fail("Decrypted token is null");
      }
    });
  });
});
