"use client";

import * as React from "react";
import { usePermission } from "@/hooks/usePermission";
import { type Action } from "@/lib/permissions";

interface PermissionGateProps {
  action: Action;
  verticalId?: string | null;
  eventId?: string | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  action,
  verticalId,
  eventId,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canModifyTask, canManageTeam } = usePermission();

  const hasAccess = React.useMemo(() => {
    // 1. Basic permission check
    if (!can(action)) return false;

    // 2. Vertical scoping check if verticalId is supplied
    if (verticalId !== undefined && !canModifyTask(verticalId)) {
      return false;
    }

    // 3. Event scoping check if eventId is supplied
    if (eventId !== undefined && eventId && !canManageTeam(eventId)) {
      return false;
    }

    return true;
  }, [action, verticalId, eventId, can, canModifyTask, canManageTeam]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
