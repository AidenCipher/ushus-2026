"use client";

import * as React from "react";
import { TaskStatus } from "@prisma/client";
import { differenceInDays } from "date-fns";

interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  progressPercent: number;
}

interface GanttTaskBarProps {
  task: GanttTask;
  timelineStart: Date;
  dayWidth?: number;
}

export function GanttTaskBar({
  task,
  timelineStart,
  dayWidth = 60,
}: GanttTaskBarProps) {
  const startOffset = Math.max(0, differenceInDays(new Date(task.startDate), new Date(timelineStart)));
  const duration = Math.max(1, differenceInDays(new Date(task.endDate), new Date(task.startDate)) + 1);

  const left = startOffset * dayWidth;
  const width = duration * dayWidth;

  const colorClass = React.useMemo(() => {
    switch (task.status) {
      case TaskStatus.NOT_STARTED:
        return "bg-slate-500";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-500";
      case TaskStatus.COMPLETED:
        return "bg-emerald-500";
      case TaskStatus.DELAYED:
        return "bg-amber-500";
      case TaskStatus.BLOCKED:
        return "bg-rose-500";
      default:
        return "bg-slate-400";
    }
  }, [task.status]);

  return (
    <div
      data-testid={`gantt-task-bar-${task.id}`}
      className="absolute h-8 rounded-md flex items-center shadow-md select-none pointer-events-auto"
      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
    >
      {/* Background and progress container */}
      <div className={`relative w-full h-full rounded-md overflow-hidden ${colorClass} bg-opacity-90`}>
        {/* Progress fill */}
        <div
          data-testid={`gantt-task-progress-${task.id}`}
          className="absolute left-0 top-0 bottom-0 bg-black bg-opacity-20 transition-all duration-300"
          style={{ width: `${task.progressPercent}%` }}
        />
        
        {/* Label */}
        <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold text-white truncate">
          {task.title}
        </span>
      </div>
    </div>
  );
}
