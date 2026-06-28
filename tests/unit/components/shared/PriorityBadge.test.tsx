import * as React from "react";
import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { TaskPriority } from "@prisma/client";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("PriorityBadge Component", () => {
  it("should render correct priority label", () => {
    render(<PriorityBadge priority={TaskPriority.HIGH} />);
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("should have zero accessibility issues", async () => {
    const { container } = render(<PriorityBadge priority={TaskPriority.CRITICAL} />);
    
    // Check aria-label
    const badge = screen.getByLabelText("Task priority: critical");
    expect(badge).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
