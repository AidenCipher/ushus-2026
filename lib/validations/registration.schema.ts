import { z } from "zod";
import { RegistrationStatus, RegistrationType } from "@prisma/client";

const TeamMemberInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[0-9\s\-()]{10,20}$/, "Invalid phone format"),
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

  // WS2 & WS2A mandatory additions
  registrationType: z.nativeEnum(RegistrationType).default(RegistrationType.INDIVIDUAL_EVENT),
  contingentId: z.string().optional().nullable(),
  accommodationRequested: z.boolean().default(false),
  facultyName: z.string().min(2, "Faculty coordinator name is required"),
  facultyEmail: z.string().email("Valid faculty coordinator email is required"),
  facultyPhone: z.string().min(10, "Faculty coordinator phone must be at least 10 digits").regex(/^\+?[0-9\s\-()]{10,20}$/, "Invalid faculty phone format"),
});

export const RegistrationUpdateSchema = z.object({
  teamName: z.string().max(100).optional().nullable(),
  teamMembers: z.array(TeamMemberInfoSchema).optional().nullable(),
  status: z.nativeEnum(RegistrationStatus).optional(),
  notes: z.string().max(1000).optional().nullable(),
  externalFormRef: z.string().max(200).optional().nullable(),
  accommodationRequested: z.boolean().optional(),
  facultyName: z.string().min(2).optional(),
  facultyEmail: z.string().email().optional(),
  facultyPhone: z.string().min(10).optional(),
});

export type RegistrationCreateInput = z.infer<typeof RegistrationCreateSchema>;
export type RegistrationUpdateInput = z.infer<typeof RegistrationUpdateSchema>;

