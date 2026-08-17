import { z } from "zod";
import { RegistrationStatus, RegistrationType } from "@prisma/client";

const PHONE_REGEX = /^\+?[0-9\s\-()]{10,20}$/;

export const AcademicYearValues = ["FIRST_YEAR", "SECOND_YEAR"] as const;
export type AcademicYear = (typeof AcademicYearValues)[number];

// Every competitor slot — including the sole slot on a 1-person event — is
// captured with this full field set. No field is optional: the brief calls
// for every detail on every person before payment.
export const TeamMemberInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registerNumber: z.string().min(1, "Register number is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(PHONE_REGEX, "Invalid phone format"),
  college: z.string().min(1, "College is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  year: z.enum(AcademicYearValues, { message: "Select first or second year" }),
  accommodationRequested: z.boolean(),
});

export type TeamMemberInfo = z.infer<typeof TeamMemberInfoSchema>;

export const RegistrationCreateSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  eventId: z.string().uuid("Invalid event ID"),
  teamName: z.string().max(100).optional().nullable(),
  // Exact-length checking against the event's teamSize happens in the route
  // handler, where the event is loaded — Zod only enforces per-member shape here.
  teamMembers: z.array(TeamMemberInfoSchema).min(1, "At least one competitor is required"),
  externalFormRef: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  // No `status` field: every registration is created PENDING server-side —
  // status transitions only happen through payment verification.

  // WS2 & WS2A mandatory additions
  registrationType: z.nativeEnum(RegistrationType).default(RegistrationType.INDIVIDUAL_EVENT),
  contingentId: z.string().optional().nullable(),
  // Derived server-side as "any member requested it" — not client-trusted.
  accommodationRequested: z.boolean().default(false),
  facultyName: z.string().min(2, "Faculty coordinator name is required"),
  facultyEmail: z.string().email("Valid faculty coordinator email is required"),
  facultyPhone: z.string().min(10, "Faculty coordinator phone must be at least 10 digits").regex(PHONE_REGEX, "Invalid faculty phone format"),
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

// One entry of a contingent bundle: one event + its full roster.
export const ContingentEntrySchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  teamMembers: z.array(TeamMemberInfoSchema).min(1, "At least one competitor is required"),
});

export const ContingentCreateSchema = z.object({
  contingentId: z.string().min(1, "Missing contingent ID"),
  collegeName: z.string().min(2, "College name is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  facultyName: z.string().min(2, "Faculty coordinator name is required"),
  facultyEmail: z.string().email("Valid faculty coordinator email is required"),
  facultyPhone: z.string().min(10, "Faculty coordinator phone must be at least 10 digits").regex(PHONE_REGEX, "Invalid faculty phone format"),
  entries: z.array(ContingentEntrySchema).min(1, "At least one event is required"),
});

export type RegistrationCreateInput = z.infer<typeof RegistrationCreateSchema>;
export type RegistrationUpdateInput = z.infer<typeof RegistrationUpdateSchema>;
export type ContingentCreateInput = z.infer<typeof ContingentCreateSchema>;
