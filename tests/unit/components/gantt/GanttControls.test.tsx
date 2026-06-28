import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GanttControls } from "@/components/gantt/GanttControls";

describe("GanttControls Component", () => {
  const mockOnZoomChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GANTT-U-005: GanttControls zoom default is active based on props", () => {
    render(<GanttControls zoom="week" onZoomChange={mockOnZoomChange} />);
    
    const weekButton = screen.getByRole("button", { name: /week/i });
    expect(weekButton).toHaveClass("bg-primary"); // or default active styling
  });

  it("GANTT-U-006: Clicking Month zoom emits correct event", () => {
    render(<GanttControls zoom="week" onZoomChange={mockOnZoomChange} />);

    const monthButton = screen.getByRole("button", { name: /month/i });
    fireEvent.click(monthButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith("month");
  });
});
