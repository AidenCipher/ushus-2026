import { Role } from "@prisma/client";

/**
 * USHUS 2026 — Centralised Permission System
 *
 * This is the SINGLE SOURCE OF TRUTH for all RBAC logic.
 * Adding a new role or action requires updating this file only.
 * All API routes and middleware reference these helpers.
 */

// ─── Actions ──────────────────────────────────────────────────────────────────

export const Actions = {
  // Public pages
  VIEW_LANDING: "VIEW_LANDING",
  VIEW_REGISTER: "VIEW_REGISTER",

  // Participant actions
  VIEW_OWN_REGISTRATION: "VIEW_OWN_REGISTRATION",
  VIEW_PARTICIPANT_DASHBOARD: "VIEW_PARTICIPANT_DASHBOARD",

  // Task actions
  VIEW_GANTT: "VIEW_GANTT",
  CREATE_TASK: "CREATE_TASK",
  UPDATE_OWN_TASK: "UPDATE_OWN_TASK",
  UPDATE_ANY_TASK: "UPDATE_ANY_TASK",
  DELETE_TASK: "DELETE_TASK",
  APPROVE_TASK_UPDATE: "APPROVE_TASK_UPDATE",

  // Team actions
  VIEW_TEAM: "VIEW_TEAM",
  MANAGE_TEAM: "MANAGE_TEAM",

  // Calendar actions
  VIEW_CALENDAR: "VIEW_CALENDAR",
  MANAGE_CALENDAR: "MANAGE_CALENDAR",

  // Announcement actions
  VIEW_ANNOUNCEMENTS: "VIEW_ANNOUNCEMENTS",
  CREATE_ANNOUNCEMENT: "CREATE_ANNOUNCEMENT",
  MANAGE_ANNOUNCEMENTS: "MANAGE_ANNOUNCEMENTS",

  // Notification actions
  VIEW_NOTIFICATIONS: "VIEW_NOTIFICATIONS",

  // Admin actions
  ACCESS_ADMIN_SETTINGS: "ACCESS_ADMIN_SETTINGS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_VERTICALS: "MANAGE_VERTICALS",
  MANAGE_EVENTS: "MANAGE_EVENTS",
  VIEW_AUDIT_LOGS: "VIEW_AUDIT_LOGS",

  // Dashboard access
  VIEW_ORGANISER_DASHBOARD: "VIEW_ORGANISER_DASHBOARD",
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];

// ─── Permission Map ───────────────────────────────────────────────────────────

const permissionMap: Record<Role, Set<Action>> = {
  PARTICIPANT: new Set([
    Actions.VIEW_LANDING,
    Actions.VIEW_REGISTER,
    Actions.VIEW_OWN_REGISTRATION,
    Actions.VIEW_PARTICIPANT_DASHBOARD,
    Actions.VIEW_ANNOUNCEMENTS,
    Actions.VIEW_CALENDAR,
  ]),

  VOLUNTEER: new Set([
    Actions.VIEW_LANDING,
    Actions.VIEW_REGISTER,
    Actions.VIEW_GANTT,
    Actions.UPDATE_OWN_TASK,
    Actions.VIEW_TEAM,
    Actions.VIEW_CALENDAR,
    Actions.VIEW_ANNOUNCEMENTS,
    Actions.VIEW_NOTIFICATIONS,
    Actions.VIEW_ORGANISER_DASHBOARD,
  ]),

  ORGANISER: new Set([
    Actions.VIEW_LANDING,
    Actions.VIEW_REGISTER,
    Actions.VIEW_GANTT,
    Actions.CREATE_TASK,
    Actions.UPDATE_OWN_TASK,
    Actions.UPDATE_ANY_TASK,
    Actions.DELETE_TASK,
    Actions.APPROVE_TASK_UPDATE,
    Actions.VIEW_TEAM,
    Actions.MANAGE_TEAM,
    Actions.VIEW_CALENDAR,
    Actions.MANAGE_CALENDAR,
    Actions.VIEW_ANNOUNCEMENTS,
    Actions.CREATE_ANNOUNCEMENT,
    Actions.VIEW_NOTIFICATIONS,
    Actions.VIEW_ORGANISER_DASHBOARD,
  ]),

  ADMIN: new Set([
    Actions.VIEW_LANDING,
    Actions.VIEW_REGISTER,
    Actions.VIEW_OWN_REGISTRATION,
    Actions.VIEW_PARTICIPANT_DASHBOARD,
    Actions.VIEW_GANTT,
    Actions.CREATE_TASK,
    Actions.UPDATE_OWN_TASK,
    Actions.UPDATE_ANY_TASK,
    Actions.DELETE_TASK,
    Actions.APPROVE_TASK_UPDATE,
    Actions.VIEW_TEAM,
    Actions.MANAGE_TEAM,
    Actions.VIEW_CALENDAR,
    Actions.MANAGE_CALENDAR,
    Actions.VIEW_ANNOUNCEMENTS,
    Actions.CREATE_ANNOUNCEMENT,
    Actions.MANAGE_ANNOUNCEMENTS,
    Actions.VIEW_NOTIFICATIONS,
    Actions.ACCESS_ADMIN_SETTINGS,
    Actions.MANAGE_USERS,
    Actions.MANAGE_VERTICALS,
    Actions.MANAGE_EVENTS,
    Actions.VIEW_AUDIT_LOGS,
    Actions.VIEW_ORGANISER_DASHBOARD,
  ]),
};

// ─── Permission Helpers ───────────────────────────────────────────────────────

/**
 * Check if a role has permission to perform an action
 */
export function hasPermission(role: Role, action: Action): boolean {
  const permissions = permissionMap[role];
  if (!permissions) return false;
  return permissions.has(action);
}

/**
 * Check if a role can access a specific dashboard route
 */
export function canAccessRoute(role: Role, pathname: string): boolean {
  // Public routes — accessible by all
  if (
    pathname === "/" ||
    pathname === "/register" ||
    pathname === "/login" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return true;
  }

  // Participant dashboard
  if (pathname.startsWith("/dashboard/participant")) {
    return role === "PARTICIPANT" || role === "ADMIN";
  }

  // Admin settings — ADMIN only
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin")) {
    return role === "ADMIN";
  }

  // Organiser dashboard — VOLUNTEER, ORGANISER, ADMIN
  if (pathname.startsWith("/organiser") || pathname.startsWith("/dashboard/organiser")) {
    return ["VOLUNTEER", "ORGANISER", "ADMIN"].includes(role);
  }

  // Participant dashboard
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/dashboard/participant")) {
    return role === "PARTICIPANT" || role === "ADMIN";
  }

  // Default deny
  return false;
}

/**
 * Get the appropriate dashboard redirect path for a role
 */
export function getDashboardPath(role: Role): string {
  switch (role) {
    case "PARTICIPANT":
      return "/dashboard";
    case "VOLUNTEER":
    case "ORGANISER":
      return "/organiser";
    case "ADMIN":
      return "/admin";
    default:
      return "/login";
  }
}

/**
 * Get all permissions for a role (useful for debugging/admin views)
 */
export function getPermissions(role: Role): Action[] {
  const permissions = permissionMap[role];
  return permissions ? Array.from(permissions) : [];
}

/**
 * Check if user can modify a task in a specific vertical
 * ORGANISER can only modify tasks in their own vertical
 * ADMIN can modify any task
 */
export function canModifyTaskInVertical(
  role: Role,
  userVerticalId: string | null | undefined,
  taskVerticalId: string | null | undefined
): boolean {
  if (role === "ADMIN") return true;
  if (role === "ORGANISER" && userVerticalId && taskVerticalId) {
    return userVerticalId === taskVerticalId;
  }
  return false;
}

/**
 * Check if user can manage team in a specific event
 * ORGANISER can only manage team in their own event
 * ADMIN can manage any team
 */
export function canManageTeamInEvent(
  role: Role,
  userEventId: string | null | undefined,
  targetEventId: string
): boolean {
  if (role === "ADMIN") return true;
  if (role === "ORGANISER" && userEventId) {
    return userEventId === targetEventId;
  }
  return false;
}
