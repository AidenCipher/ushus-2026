import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskUpdateModal } from "@/components/tasks/TaskUpdateModal";

describe("TaskUpdateModal Component", () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <TaskUpdateModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} currentProgress={20} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should enforce mandatory note validation on submit", () => {
    render(
      <TaskUpdateModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} currentProgress={20} />
    );

    const form = screen.getByRole("button", { name: /submit update/i });
    fireEvent.click(form);

    expect(screen.getByTestId("error-message")).toHaveTextContent("Note is required");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should reject updates with note length less than 20 characters", () => {
    render(
      <TaskUpdateModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} currentProgress={20} />
    );

    const textarea = screen.getByPlaceholderText(/describe what has been completed/i);
    fireEvent.change(textarea, { target: { value: "Short note" } });

    const submit = screen.getByRole("button", { name: /submit update/i });
    fireEvent.click(submit);

    expect(screen.getByTestId("error-message")).toHaveTextContent("Note must be at least 20 characters");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show character counter reflecting note length", () => {
    render(
      <TaskUpdateModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} currentProgress={20} />
    );

    const textarea = screen.getByPlaceholderText(/describe what has been completed/i);
    const counter = screen.getByTestId("char-counter");

    expect(counter).toHaveTextContent("0/20");

    fireEvent.change(textarea, { target: { value: "This is a longer note" } }); // 21 chars
    expect(counter).toHaveTextContent("21/20");
  });

  it("should succeed with valid note lengths", () => {
    render(
      <TaskUpdateModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} currentProgress={20} />
    );

    const textarea = screen.getByPlaceholderText(/describe what has been completed/i);
    fireEvent.change(textarea, { target: { value: "This is a valid update description note that is 20+ chars" } });

    const submit = screen.getByRole("button", { name: /submit update/i });
    fireEvent.click(submit);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      progressPercent: 20,
      note: "This is a valid update description note that is 20+ chars",
    });
  });
});
