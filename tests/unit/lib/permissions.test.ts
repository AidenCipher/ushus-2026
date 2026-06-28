import { Role } from "@prisma/client";
import { 
  hasPermission, 
  canAccessRoute, 
  getDashboardPath, 
  canModifyTaskInVertical, 
  canManageTeamInEvent, 
  Actions 
} from "@/lib/permissions";

describe("Permissions System", () => {
  describe("hasPermission", () => {
    it("should allow ADMIN to perform all actions", () => {
      Object.values(Actions).forEach((action) => {
        expect(hasPermission(Role.ADMIN, action)).toBe(true);
      });
    });

    it("should restrict PARTICIPANT to view actions only", () => {
      expect(hasPermission(Role.PARTICIPANT, Actions.VIEW_LANDING)).toBe(true);
      expect(hasPermission(Role.PARTICIPANT, Actions.VIEW_REGISTER)).toBe(true);
      expect(hasPermission(Role.PARTICIPANT, Actions.VIEW_OWN_REGISTRATION)).toBe(true);
      expect(hasPermission(Role.PARTICIPANT, Actions.VIEW_PARTICIPANT_DASHBOARD)).toBe(true);
      expect(hasPermission(Role.PARTICIPANT, Actions.VIEW_ANNOUNCEMENTS)).toBe(true);

      // Should deny write actions
      expect(hasPermission(Role.PARTICIPANT, Actions.CREATE_TASK)).toBe(false);
      expect(hasPermission(Role.PARTICIPANT, Actions.ACCESS_ADMIN_SETTINGS)).toBe(false);
    });

    it("should allow ORGANISER to create and modify tasks/calendar but restrict admin settings", () => {
      expect(hasPermission(Role.ORGANISER, Actions.CREATE_TASK)).toBe(true);
      expect(hasPermission(Role.ORGANISER, Actions.MANAGE_CALENDAR)).toBe(true);
      expect(hasPermission(Role.ORGANISER, Actions.ACCESS_ADMIN_SETTINGS)).toBe(false);
    });
  });

  describe("canAccessRoute", () => {
    it("should allow anyone to access public paths", () => {
      expect(canAccessRoute(Role.PARTICIPANT, "/")).toBe(true);
      expect(canAccessRoute(Role.ORGANISER, "/register")).toBe(true);
      expect(canAccessRoute(Role.VOLUNTEER, "/login")).toBe(true);
    });

    it("should restrict admin dashboard to ADMIN only", () => {
      expect(canAccessRoute(Role.ADMIN, "/admin")).toBe(true);
      expect(canAccessRoute(Role.ADMIN, "/dashboard/admin")).toBe(true);
      expect(canAccessRoute(Role.ORGANISER, "/admin")).toBe(false);
      expect(canAccessRoute(Role.PARTICIPANT, "/admin")).toBe(false);
    });

    it("should allow VOLUNTEER, ORGANISER, and ADMIN to access organiser dashboard", () => {
      expect(canAccessRoute(Role.VOLUNTEER, "/organiser")).toBe(true);
      expect(canAccessRoute(Role.VOLUNTEER, "/dashboard/organiser")).toBe(true);
      expect(canAccessRoute(Role.ORGANISER, "/organiser")).toBe(true);
      expect(canAccessRoute(Role.ADMIN, "/organiser")).toBe(true);
      expect(canAccessRoute(Role.PARTICIPANT, "/organiser")).toBe(false);
    });
  });

  describe("getDashboardPath", () => {
    it("should return the correct redirect route for each role", () => {
      expect(getDashboardPath(Role.PARTICIPANT)).toBe("/dashboard");
      expect(getDashboardPath(Role.VOLUNTEER)).toBe("/organiser");
      expect(getDashboardPath(Role.ORGANISER)).toBe("/organiser");
      expect(getDashboardPath(Role.ADMIN)).toBe("/admin");
    });
  });

  describe("canModifyTaskInVertical", () => {
    it("should allow ADMIN to modify tasks in any vertical", () => {
      expect(canModifyTaskInVertical(Role.ADMIN, "v1", "v2")).toBe(true);
    });

    it("should allow ORGANISER to modify tasks only in their own vertical", () => {
      expect(canModifyTaskInVertical(Role.ORGANISER, "v1", "v1")).toBe(true);
      expect(canModifyTaskInVertical(Role.ORGANISER, "v1", "v2")).toBe(false);
    });
  });

  describe("canManageTeamInEvent", () => {
    it("should allow ADMIN to manage team in any event", () => {
      expect(canManageTeamInEvent(Role.ADMIN, "e1", "e2")).toBe(true);
    });

    it("should allow ORGANISER to manage team in their own event", () => {
      expect(canManageTeamInEvent(Role.ORGANISER, "e1", "e1")).toBe(true);
      expect(canManageTeamInEvent(Role.ORGANISER, "e1", "e2")).toBe(false);
    });
  });
});
