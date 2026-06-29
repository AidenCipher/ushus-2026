"use client";

import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  hasPermission,
  canModifyTaskInVertical,
  canManageTeamInEvent,
  type Action,
} from "@/lib/permissions";

/**
 * Client-side permission check hook.
 * NOTE: This is for UI rendering only. All actual permission enforcement
 * happens server-side in API routes and middleware.
 */
export function usePermission() {
  const { user } = useAuth();

  const can = useCallback(
    (action: Action): boolean => {
      if (!user?.role) return false;
      return hasPermission(user.role, action);
    },
    [user?.role]
  );

  const canModifyTask = useCallback(
    (taskVerticalId: string | null | undefined): boolean => {
      if (!user?.role) return false;
      return canModifyTaskInVertical(user.role, user.verticalId, taskVerticalId);
    },
    [user?.role, user?.verticalId]
  );

  const canManageTeam = useCallback(
    (eventId: string): boolean => {
      if (!user?.role) return false;
      return canManageTeamInEvent(user.role, user.eventId, eventId);
    },
    [user?.role, user?.eventId]
  );

  return { can, canModifyTask, canManageTeam };
}
