import * as React from "react";
import { render, screen } from "@testing-library/react";
import { StatsBar } from "@/components/landing/StatsBar";

// Mock framer-motion useInView hook to instantly trigger animation
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    useInView: () => true, // Simulate element always in view
  };
});

describe("StatsBar Component", () => {
  it("should render four statistics cards", () => {
    render(<StatsBar />);
    
    const cards = screen.getAllByTestId("stat-counter");
    expect(cards).toHaveLength(4);
  });

  it("should display correct metrics labels", () => {
    render(<StatsBar />);

    expect(screen.getByText(/participants/i)).toBeInTheDocument();
    expect(screen.getByText(/events/i)).toBeInTheDocument();
    expect(screen.getByText(/verticals/i)).toBeInTheDocument();
    expect(screen.getByText(/colleges/i)).toBeInTheDocument();
  });
});
