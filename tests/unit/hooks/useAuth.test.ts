import { renderHook } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Mock next-auth/react and next/navigation
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("useAuth Custom Hook", () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });
  });

  it("should return loading states correctly", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should parse an authenticated PARTICIPANT session correctly", () => {
    const mockSession = {
      user: {
        id: "participant-id",
        email: "p@college.edu",
        name: "Pat",
        role: "PARTICIPANT",
        isActive: true,
        verticalId: null,
        eventId: null,
      },
    };
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isParticipant).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.user).toEqual(mockSession.user);
  });

  it("should verify admin privileges and editor actions", () => {
    const mockSession = {
      user: {
        id: "admin-id",
        email: "admin@test.ushus",
        name: "Admin",
        role: "ADMIN",
        isActive: true,
        verticalId: null,
        eventId: null,
      },
    };
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canApprove).toBe(true);
  });

  it("should route to correct dashboard paths on goToDashboard call", () => {
    const mockSession = {
      user: {
        id: "organiser-id",
        email: "o@test.ushus",
        name: "Org",
        role: "ORGANISER",
        isActive: true,
      },
    };
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    const { result } = renderHook(() => useAuth());
    result.current.goToDashboard();

    expect(mockRouterPush).toHaveBeenCalledWith("/organiser");
  });

  it("should trigger NextAuth signOut on logout call", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { result } = renderHook(() => useAuth());
    await result.current.logout();

    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login" });
  });
});
