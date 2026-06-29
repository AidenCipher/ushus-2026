import { z } from "zod";
import { RegistrationStatus } from "@prisma/client";

const TeamMemberInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[1-9]\d{1,14}$|^[0-9]{10}$/, "Invalid phone format"),
  college: z.string().optional(),
});

export const RegistrationCreateSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  eventId: z.string().uuid("Invalid event ID"),
  teamName: z.string().max(100).optional().nullable(),
  teamMembers: z.array(TeamMemberInfoSchema).optional().nullable(),
  externalFormRef: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(RegistrationStatus).default(RegistrationStatus.PENDING),
});

export const RegistrationUpdateSchema = z.object({
  teamName: z.string().max(100).optional().nullable(),
  teamMembers: z.array(TeamMemberInfoSchema).optional().nullable(),
  status: z.nativeEnum(RegistrationStatus).optional(),
  notes: z.string().max(1000).optional().nullable(),
  externalFormRef: z.string().max(200).optional().nullable(),
});

export type RegistrationCreateInput = z.infer<typeof RegistrationCreateSchema>;
export type RegistrationUpdateInput = z.infer<typeof RegistrationUpdateSchema>;
