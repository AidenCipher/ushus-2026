import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { TeamMemberInfo } from "@/lib/validations/registration.schema";

function normalisePhone(p: string): string {
  return p.replace(/[\s\-()+]/g, "");
}

/**
 * A student can compete in multiple different events, but can't appear on
 * two different teams for the SAME event. Shared by every registration
 * entry point (authenticated dashboard flow, public combined flow, and the
 * contingent bundle) so the rule can't drift between them.
 */
export async function findRosterConflict(
  eventId: string,
  members: TeamMemberInfo[]
): Promise<string | null> {
  const registerNumbersToCheck = members.map((m) => m.registerNumber.trim().toLowerCase());
  const emailsToCheck = members.map((m) => m.email.toLowerCase());
  const phonesToCheck = members.map((m) => normalisePhone(m.phone));

  const siblingRegs = await prisma.registration.findMany({
    where: { eventId, teamMembers: { not: Prisma.JsonNull } },
    select: { teamMembers: true },
  });

  for (const reg of siblingRegs) {
    if (!reg.teamMembers || !Array.isArray(reg.teamMembers)) continue;
    for (const m of reg.teamMembers as Array<{
      name?: string;
      registerNumber?: string;
      email?: string;
      phone?: string;
    }>) {
      const mRegNo = m.registerNumber ? m.registerNumber.trim().toLowerCase() : "";
      const mEmail = m.email ? m.email.toLowerCase() : "";
      const mPhone = m.phone ? normalisePhone(m.phone) : "";

      if (
        (mRegNo && registerNumbersToCheck.includes(mRegNo)) ||
        (mEmail && emailsToCheck.includes(mEmail)) ||
        (mPhone && phonesToCheck.includes(mPhone))
      ) {
        return `"${m.name ?? "A competitor"}" is already on another team registered for this event.`;
      }
    }
  }
  return null;
}

export class CapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CapacityError";
  }
}
