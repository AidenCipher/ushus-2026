import { prisma } from "@/lib/db";
import { getClientIP } from "@/lib/utils";
import { Prisma } from "@prisma/client";

interface AuditLogParams {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Write an audit log entry for any data-mutation action.
 * Called from every API route that creates, updates, or deletes data.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        metadata: (params.metadata as Prisma.InputJsonValue) ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    // Audit log failures should not break the main operation
    console.error("[AuditLog] Failed to write audit log:", error);
  }
}

/**
 * Helper to extract IP and write audit log from a request context
 */
export async function auditFromRequest(
  headers: Headers,
  params: Omit<AuditLogParams, "ipAddress">
): Promise<void> {
  const ipAddress = getClientIP(headers);
  await writeAuditLog({ ...params, ipAddress });
}

/**
 * Common audit action constants
 */
export const AuditActions = {
  // Auth
  LOGIN: "LOGIN",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED: "PASSWORD_RESET_COMPLETED",

  // Users
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_REACTIVATED: "USER_REACTIVATED",
  ROLE_CHANGED: "ROLE_CHANGED",

  // Tasks
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  TASK_REASSIGNED: "TASK_REASSIGNED",

  // Task Updates
  TASK_UPDATE_SUBMITTED: "TASK_UPDATE_SUBMITTED",
  TASK_UPDATE_APPROVED: "TASK_UPDATE_APPROVED",
  TASK_UPDATE_REJECTED: "TASK_UPDATE_REJECTED",

  // Events
  EVENT_CREATED: "EVENT_CREATED",
  EVENT_UPDATED: "EVENT_UPDATED",
  EVENT_DELETED: "EVENT_DELETED",

  // Verticals
  VERTICAL_CREATED: "VERTICAL_CREATED",
  VERTICAL_UPDATED: "VERTICAL_UPDATED",
  VERTICAL_DELETED: "VERTICAL_DELETED",

  // Registrations
  REGISTRATION_CREATED: "REGISTRATION_CREATED",
  REGISTRATION_UPDATED: "REGISTRATION_UPDATED",
  REGISTRATION_CANCELLED: "REGISTRATION_CANCELLED",

  // Team
  TEAM_MEMBER_ADDED: "TEAM_MEMBER_ADDED",
  TEAM_MEMBER_REMOVED: "TEAM_MEMBER_REMOVED",
  TEAM_MEMBER_ROLE_CHANGED: "TEAM_MEMBER_ROLE_CHANGED",

  // Calendar
  CALENDAR_EVENT_CREATED: "CALENDAR_EVENT_CREATED",
  CALENDAR_EVENT_UPDATED: "CALENDAR_EVENT_UPDATED",
  CALENDAR_EVENT_DELETED: "CALENDAR_EVENT_DELETED",

  // Announcements
  ANNOUNCEMENT_CREATED: "ANNOUNCEMENT_CREATED",
  ANNOUNCEMENT_UPDATED: "ANNOUNCEMENT_UPDATED",
  ANNOUNCEMENT_DELETED: "ANNOUNCEMENT_DELETED",

  // Notifications
  NOTIFICATION_SENT: "NOTIFICATION_SENT",

  // Admin
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
