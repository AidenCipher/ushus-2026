import { z } from "zod";
import { TeamRole } from "@prisma/client";

export const TeamMemberCreateSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  eventId: z.string().uuid("Invalid event ID"),
  roleInTeam: z.nativeEnum(TeamRole).default(TeamRole.VOLUNTEER),
});

export const TeamMemberUpdateSchema = z.object({
  roleInTeam: z.nativeEnum(TeamRole).optional(),
  isActive: z.boolean().optional(),
});

export type TeamMemberCreateInput = z.infer<typeof TeamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof TeamMemberUpdateSchema>;
