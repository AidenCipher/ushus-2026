import * as React from "react";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TaskStatus } from "@prisma/client";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("StatusBadge Component", () => {
  it("should render correct status text", () => {
    render(<StatusBadge status={TaskStatus.IN_PROGRESS} />);
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });

  it("should support accessibility properties", async () => {
    const { container } = render(<StatusBadge status={TaskStatus.COMPLETED} />);
    
    // Check aria-label
    const badge = screen.getByLabelText("Task status: completed");
    expect(badge).toBeInTheDocument();

    // Check Axe accessibility violations
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
