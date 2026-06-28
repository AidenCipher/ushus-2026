import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const TaskCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z.string().max(5000).optional(),
  eventId: z.string().uuid("Invalid event ID").optional(),
  verticalId: z.string().uuid("Invalid vertical ID").optional(),
  assignedToId: z.string().uuid("Invalid assignee ID").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  parentTaskId: z.string().uuid("Invalid parent task ID").optional(),
  dependsOnIds: z.array(z.string().uuid()).default([]),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.NOT_STARTED),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  { message: "End date must be on or after start date", path: ["endDate"] }
);

export const TaskUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  parentTaskId: z.string().uuid().optional().nullable(),
  dependsOnIds: z.array(z.string().uuid()).optional(),
  eventId: z.string().uuid().optional().nullable(),
  verticalId: z.string().uuid().optional().nullable(),
});

export const TaskDragUpdateSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: "End date must be on or after start date", path: ["endDate"] }
);

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;
export type TaskDragUpdateInput = z.infer<typeof TaskDragUpdateSchema>;
