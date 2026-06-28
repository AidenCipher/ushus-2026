import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { usePermission } from "@/hooks/usePermission";
import { Actions } from "@/lib/permissions";

jest.mock("@/hooks/usePermission");

describe("PermissionGate Component", () => {
  const mockCan = jest.fn();
  const mockCanModifyTask = jest.fn();
  const mockCanManageTeam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePermission as jest.Mock).mockReturnValue({
      can: mockCan,
      canModifyTask: mockCanModifyTask,
      canManageTeam: mockCanManageTeam,
    });
  });

  it("should render children if user has basic permission", () => {
    mockCan.mockReturnValue(true);

    render(
      <PermissionGate action={Actions.CREATE_TASK}>
        <div data-testid="child">Allowed Content</div>
      </PermissionGate>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Allowed Content")).toBeInTheDocument();
  });

  it("should render fallback if user does not have permission", () => {
    mockCan.mockReturnValue(false);

    render(
      <PermissionGate 
        action={Actions.CREATE_TASK} 
        fallback={<div data-testid="fallback">Denied Content</div>}
      >
        <div>Allowed Content</div>
      </PermissionGate>
    );

    expect(screen.queryByText("Allowed Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("should check vertical scope when verticalId is provided", () => {
    mockCan.mockReturnValue(true);
    mockCanModifyTask.mockReturnValue(false); // Refused vertical match

    render(
      <PermissionGate action={Actions.UPDATE_OWN_TASK} verticalId="v1">
        <div>Allowed Content</div>
      </PermissionGate>
    );

    expect(screen.queryByText("Allowed Content")).not.toBeInTheDocument();
    expect(mockCanModifyTask).toHaveBeenCalledWith("v1");
  });
});
