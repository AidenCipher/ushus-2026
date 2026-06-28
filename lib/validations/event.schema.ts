import { z } from "zod";
import { EventStatus } from "@prisma/client";

export const EventCreateSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters").max(200),
  description: z.string().max(5000).optional(),
  verticalId: z.string().uuid("Invalid vertical ID"),
  eventHeadId: z.string().uuid("Invalid event head ID").optional().nullable(),
  dateStart: z.coerce.date().optional().nullable(),
  dateEnd: z.coerce.date().optional().nullable(),
  venue: z.string().max(300).optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  registrationDeadline: z.coerce.date().optional().nullable(),
  rulesDocumentUrl: z.string().url().optional().nullable(),
  prizePool: z.string().max(100).optional().nullable(),
  status: z.nativeEnum(EventStatus).default(EventStatus.UPCOMING),
});

export const EventUpdateSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  verticalId: z.string().uuid().optional(),
  eventHeadId: z.string().uuid().optional().nullable(),
  dateStart: z.coerce.date().optional().nullable(),
  dateEnd: z.coerce.date().optional().nullable(),
  venue: z.string().max(300).optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  registrationDeadline: z.coerce.date().optional().nullable(),
  rulesDocumentUrl: z.string().url().optional().nullable(),
  prizePool: z.string().max(100).optional().nullable(),
  status: z.nativeEnum(EventStatus).optional(),
});

export type EventCreateInput = z.infer<typeof EventCreateSchema>;
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;
