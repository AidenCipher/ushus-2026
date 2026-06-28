import { z } from "zod";
import { CalendarEventStatus } from "@prisma/client";

export const CalendarEventCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(2000).optional().nullable(),
  eventId: z.string().uuid("Invalid event ID").optional().nullable(),
  verticalId: z.string().uuid("Invalid vertical ID").optional().nullable(),
  startDatetime: z.coerce.date(),
  endDatetime: z.coerce.date(),
  status: z.nativeEnum(CalendarEventStatus).default(CalendarEventStatus.PLANNED),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex colour code")
    .optional()
    .nullable(),
}).refine(
  (data) => data.endDatetime >= data.startDatetime,
  { message: "End time must be on or after start time", path: ["endDatetime"] }
);

export const CalendarEventUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  verticalId: z.string().uuid().optional().nullable(),
  startDatetime: z.coerce.date().optional(),
  endDatetime: z.coerce.date().optional(),
  status: z.nativeEnum(CalendarEventStatus).optional(),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .nullable(),
});

export type CalendarEventCreateInput = z.infer<typeof CalendarEventCreateSchema>;
export type CalendarEventUpdateInput = z.infer<typeof CalendarEventUpdateSchema>;
