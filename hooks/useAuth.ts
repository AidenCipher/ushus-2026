"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import { getDashboardPath } from "@/lib/permissions";

/**
 * Custom hook for authentication state and role-based helpers.
 * Wraps NextAuth's useSession with typed user data.
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        role: session.user.role as Role,
        verticalId: session.user.verticalId,
        eventId: session.user.eventId,
        isActive: session.user.isActive,
      }
    : null;

  const isAuthenticated = status === "authenticated" && !!user;
  const isLoading = status === "loading";

  const isAdmin = user?.role === "ADMIN";
  const isOrganiser = user?.role === "ORGANISER";
  const isVolunteer = user?.role === "VOLUNTEER";
  const isParticipant = user?.role === "PARTICIPANT";

  const canEdit = isAdmin || isOrganiser;
  const canManageTeam = isAdmin || isOrganiser;
  const canApprove = isAdmin || isOrganiser;

  const logout = useCallback(async () => {
    await signOut({ redirectTo: "/login" });
  }, []);

  const goToDashboard = useCallback(() => {
    if (user?.role) {
      router.push(getDashboardPath(user.role));
    }
  }, [user?.role, router]);

  return {
    user,
    session,
    status,
    isAuthenticated,
    isLoading,
    isAdmin,
    isOrganiser,
    isVolunteer,
    isParticipant,
    canEdit,
    canManageTeam,
    canApprove,
    logout,
    goToDashboard,
  };
}
