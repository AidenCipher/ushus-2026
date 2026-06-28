import { z } from "zod";
import { Role } from "@prisma/client";

export const UserCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().max(20).optional(),
  college: z.string().max(200).optional(),
  role: z.nativeEnum(Role).default(Role.PARTICIPANT),
  verticalId: z.string().uuid().optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  college: z.string().max(200).optional().nullable(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
  verticalId: z.string().uuid().optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  profilePictureUrl: z.string().url().optional().nullable(),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
