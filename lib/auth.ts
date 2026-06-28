import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/lib/validations/auth.schema";
import type { Role } from "@prisma/client";

/**
 * Extend NextAuth types to include custom fields in the session
 */
declare module "next-auth" {
  interface User {
    role: Role;
    verticalId: string | null;
    eventId: string | null;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      verticalId: string | null;
      eventId: string | null;
      isActive: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    verticalId: string | null;
    eventId: string | null;
    isActive: boolean;
  }
}

/**
 * Rate limiting helper — checks database for recent failed attempts
 */
async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}> {
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  // Clean up expired entries
  await prisma.rateLimitEntry.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  // Count recent attempts
  const recentEntry = await prisma.rateLimitEntry.findFirst({
    where: {
      key: `login:${ip}`,
      expiresAt: { gt: new Date() },
    },
  });

  if (!recentEntry) {
    return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
  }

  if (recentEntry.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil(
      (recentEntry.expiresAt.getTime() - Date.now()) / 1000
    );
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - recentEntry.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Record a failed login attempt
 */
async function recordFailedAttempt(ip: string): Promise<void> {
  const windowMs = 15 * 60 * 1000;
  const expiresAt = new Date(Date.now() + windowMs);
  const key = `login:${ip}`;

  const existing = await prisma.rateLimitEntry.findFirst({
    where: { key, expiresAt: { gt: new Date() } },
  });

  if (existing) {
    await prisma.rateLimitEntry.update({
      where: { id: existing.id },
      data: { count: existing.count + 1 },
    });
  } else {
    await prisma.rateLimitEntry.create({
      data: { key, count: 1, expiresAt },
    });
  }
}

/**
 * Clear failed attempts on successful login
 */
async function clearFailedAttempts(ip: string): Promise<void> {
  await prisma.rateLimitEntry.deleteMany({
    where: { key: `login:${ip}` },
  });
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        clientIp: { label: "Client IP", type: "text" },
      },
      async authorize(credentials) {
        // Validate input
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const clientIp =
          (credentials?.clientIp as string | undefined) || "unknown";

        // Rate limit check
        const rateLimit = await checkRateLimit(clientIp);
        if (!rateLimit.allowed) {
          throw new Error(
            `Too many login attempts. Try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minutes.`
          );
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          await recordFailedAttempt(clientIp);
          throw new Error("Invalid email or password");
        }

        // Check if active
        if (!user.isActive) {
          throw new Error(
            "Your account has been deactivated. Contact the organisers."
          );
        }

        // Verify password
        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          await recordFailedAttempt(clientIp);
          throw new Error("Invalid email or password");
        }

        // Clear failed attempts on success
        await clearFailedAttempts(clientIp);

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            ipAddress: clientIp,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verticalId: user.verticalId,
          eventId: user.eventId,
          isActive: user.isActive,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  cookies: {
    sessionToken: {
      name: "ushus-session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      },
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.verticalId = user.verticalId;
        token.eventId = user.eventId;
        token.isActive = user.isActive;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.verticalId = token.verticalId;
      session.user.eventId = token.eventId;
      session.user.isActive = token.isActive;
      return session;
    },
  },

  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
