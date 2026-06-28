import { renderHook } from "@testing-library/react";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/hooks/useAuth";
import { Actions } from "@/lib/permissions";
import { Role } from "@prisma/client";

// Mock useAuth hook
jest.mock("@/hooks/useAuth");

describe("usePermission Custom Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return false for all actions if user is unauthenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.can(Actions.VIEW_LANDING)).toBe(false);
    expect(result.current.canModifyTask("v1")).toBe(false);
  });

  it("should verify checks for PARTICIPANT permissions", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: Role.PARTICIPANT,
        verticalId: null,
        eventId: null,
      },
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.can(Actions.VIEW_OWN_REGISTRATION)).toBe(true);
    expect(result.current.can(Actions.CREATE_TASK)).toBe(false);
    expect(result.current.canModifyTask("v1")).toBe(false);
  });

  it("should verify ORGANISER scoped checks in tasks and teams", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: Role.ORGANISER,
        verticalId: "v1",
        eventId: "e1",
      },
    });

    const { result } = renderHook(() => usePermission());

    expect(result.current.can(Actions.CREATE_TASK)).toBe(true);
    // Can modify task within vertical v1
    expect(result.current.canModifyTask("v1")).toBe(true);
    // Cannot modify task in vertical v2
    expect(result.current.canModifyTask("v2")).toBe(false);

    // Can manage team in event e1
    expect(result.current.canManageTeam("e1")).toBe(true);
    // Cannot manage team in event e2
    expect(result.current.canManageTeam("e2")).toBe(false);
  });
});
