import * as React from "react";
import { render, screen } from "@testing-library/react";
import { GanttTaskBar } from "@/components/gantt/GanttTaskBar";
import { TaskStatus } from "@prisma/client";

const TIMELINE_START = new Date(2026, 0, 1); // Jan 1, 2026
const DAY_WIDTH = 60;

describe("GanttTaskBar Component", () => {
  it("GANTT-U-001: GanttTaskBar renders at correct x offset", () => {
    const task = {
      id: "t1",
      title: "Task 1",
      startDate: new Date(2026, 0, 6), // Offset = 5 days
      endDate: new Date(2026, 0, 10),
      status: TaskStatus.NOT_STARTED,
      progressPercent: 0,
    };

    render(
      <div className="relative">
        <GanttTaskBar task={task} timelineStart={TIMELINE_START} dayWidth={DAY_WIDTH} />
      </div>
    );

    const bar = screen.getByTestId("gantt-task-bar-t1");
    expect(bar.style.left).toBe(`${5 * DAY_WIDTH}px`);
  });

  it("GANTT-U-002: GanttTaskBar has correct width", () => {
    const task = {
      id: "t1",
      title: "Task 1",
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 10), // Duration = 10 days
      status: TaskStatus.NOT_STARTED,
      progressPercent: 0,
    };

    render(
      <div className="relative">
        <GanttTaskBar task={task} timelineStart={TIMELINE_START} dayWidth={DAY_WIDTH} />
      </div>
    );

    const bar = screen.getByTestId("gantt-task-bar-t1");
    expect(bar.style.width).toBe(`${10 * DAY_WIDTH}px`);
  });

  it("GANTT-U-003: GanttTaskBar colour for each status", () => {
    const statuses = [
      { status: TaskStatus.NOT_STARTED, expectedClass: "bg-slate-500" },
      { status: TaskStatus.IN_PROGRESS, expectedClass: "bg-blue-500" },
      { status: TaskStatus.COMPLETED, expectedClass: "bg-emerald-500" },
      { status: TaskStatus.DELAYED, expectedClass: "bg-amber-500" },
      { status: TaskStatus.BLOCKED, expectedClass: "bg-rose-500" },
    ];

    statuses.forEach(({ status, expectedClass }) => {
      const task = {
        id: "t1",
        title: "Status Task",
        startDate: new Date(2026, 0, 1),
        endDate: new Date(2026, 0, 2),
        status,
        progressPercent: 0,
      };

      const { unmount } = render(
        <div className="relative">
          <GanttTaskBar task={task} timelineStart={TIMELINE_START} dayWidth={DAY_WIDTH} />
        </div>
      );

      const bar = screen.getByTestId("gantt-task-bar-t1").firstChild;
      expect(bar).toHaveClass(expectedClass);
      unmount();
    });
  });

  it("GANTT-U-004: GanttTaskBar progress fill width matches percentage", () => {
    const task = {
      id: "t1",
      title: "Progress Task",
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 10),
      status: TaskStatus.IN_PROGRESS,
      progressPercent: 40,
    };

    render(
      <div className="relative">
        <GanttTaskBar task={task} timelineStart={TIMELINE_START} dayWidth={DAY_WIDTH} />
      </div>
    );

    const progress = screen.getByTestId("gantt-task-progress-t1");
    expect(progress.style.width).toBe("40%");
  });
});
