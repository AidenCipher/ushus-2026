"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface GanttControlsProps {
  zoom: "day" | "week" | "month";
  onZoomChange: (zoom: "day" | "week" | "month") => void;
  onTodayClick?: () => void;
}

export function GanttControls({
  zoom,
  onZoomChange,
  onTodayClick,
}: GanttControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-background border border-white/10 p-2 rounded-lg">
      <div className="flex items-center bg-white/5 p-1 rounded-md">
        <Button
          variant={zoom === "day" ? "default" : "ghost"}
          size="sm"
          className="h-8 text-xs capitalize"
          onClick={() => onZoomChange("day")}
        >
          Day
        </Button>
        <Button
          variant={zoom === "week" ? "default" : "ghost"}
          size="sm"
          className="h-8 text-xs capitalize"
          onClick={() => onZoomChange("week")}
        >
          Week
        </Button>
        <Button
          variant={zoom === "month" ? "default" : "ghost"}
          size="sm"
          className="h-8 text-xs capitalize"
          onClick={() => onZoomChange("month")}
        >
          Month
        </Button>
      </div>

      {onTodayClick && (
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onTodayClick}>
          Today
        </Button>
      )}
    </div>
  );
}
