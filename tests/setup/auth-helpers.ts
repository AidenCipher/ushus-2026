import { encode } from "next-auth/jwt";
import { TEST_USERS } from "./test-db";
import type { Page } from "@playwright/test";

const SECRET = process.env.AUTH_SECRET || "super-secret-auth-key-32-characters-minimum";

export async function getAuthCookie(role: keyof typeof TEST_USERS) {
  const user = TEST_USERS[role];
  const token = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    verticalId: 'verticalId' in user ? user.verticalId : null,
    eventId: 'eventId' in user ? user.eventId : null,
    isActive: true,
  };

  const sessionToken = await encode({
    token,
    secret: SECRET,
    maxAge: 24 * 60 * 60,
    salt: "ushus-session-token",
  });

  return `ushus-session-token=${sessionToken}`;
}

export async function getExpiredCookie() {
  const user = TEST_USERS.participant;
  const token = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: true,
  };

  const sessionToken = await encode({
    token,
    secret: SECRET,
    maxAge: -1, // Expired
    salt: "ushus-session-token",
  });

  return `ushus-session-token=${sessionToken}`;
}

export async function getTamperedCookie() {
  const cookie = await getAuthCookie("participant");
  // Replace characters in the signature (last part of JWT dot separation)
  const parts = cookie.split(".");
  if (parts.length === 3) {
    parts[2] = parts[2].substring(0, parts[2].length - 5) + "aaaaa";
  }
  return parts.join(".");
}

export async function getCookieWithWrongRole(
  actualRole: keyof typeof TEST_USERS,
  claimedRole: "ADMIN" | "ORGANISER" | "VOLUNTEER" | "PARTICIPANT"
) {
  const user = TEST_USERS[actualRole];
  const token = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: claimedRole, // Inject wrong role in the payload
    verticalId: 'verticalId' in user ? user.verticalId : null,
    eventId: 'eventId' in user ? user.eventId : null,
    isActive: true,
  };

  const sessionToken = await encode({
    token,
    secret: SECRET,
    maxAge: 24 * 60 * 60,
    salt: "ushus-session-token",
  });

  return `ushus-session-token=${sessionToken}`;
}

// Playwright UI login helper
export async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const user = TEST_USERS[role];
  await page.goto("/login");
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to happen
  let expectedPath = "/dashboard";
  if (user.role === "ADMIN") {
    expectedPath = "/admin";
  } else if (user.role === "ORGANISER" || user.role === "VOLUNTEER") {
    expectedPath = "/organiser";
  }
  await page.waitForURL(new RegExp(expectedPath));
}
