import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskApprovalButtons } from "@/components/tasks/TaskApprovalButtons";

describe("TaskApprovalButtons Component", () => {
  const mockOnApprove = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger onApprove on Approve button click", () => {
    render(<TaskApprovalButtons onApprove={mockOnApprove} onReject={mockOnReject} />);

    const approveBtn = screen.getByRole("button", { name: /approve/i });
    fireEvent.click(approveBtn);

    expect(mockOnApprove).toHaveBeenCalledTimes(1);
    expect(mockOnReject).not.toHaveBeenCalled();
  });

  it("should display rejection text area when Reject is clicked", () => {
    render(<TaskApprovalButtons onApprove={mockOnApprove} onReject={mockOnReject} />);

    const rejectBtn = screen.getByRole("button", { name: /reject/i });
    fireEvent.click(rejectBtn);

    expect(screen.getByLabelText(/rejection reason/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm rejection/i })).toBeInTheDocument();
  });

  it("should reject submissions with empty rejection reason", () => {
    render(<TaskApprovalButtons onApprove={mockOnApprove} onReject={mockOnReject} />);

    // Click reject to reveal form
    fireEvent.click(screen.getByRole("button", { name: /reject/i }));

    // Click confirm without setting a reason
    fireEvent.click(screen.getByRole("button", { name: /confirm rejection/i }));

    expect(screen.getByTestId("reject-error")).toHaveTextContent("Rejection reason is required");
    expect(mockOnReject).not.toHaveBeenCalled();
  });

  it("should call onReject when valid reason is supplied", () => {
    render(<TaskApprovalButtons onApprove={mockOnApprove} onReject={mockOnReject} />);

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));
    
    const textarea = screen.getByPlaceholderText(/why is this update being rejected/i);
    fireEvent.change(textarea, { target: { value: "Quality check failed" } });

    fireEvent.click(screen.getByRole("button", { name: /confirm rejection/i }));

    expect(mockOnReject).toHaveBeenCalledWith("Quality check failed");
  });
});
