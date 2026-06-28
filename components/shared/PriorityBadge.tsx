import * as React from "react";
import { TaskPriority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = React.useMemo(() => {
    switch (priority) {
      case TaskPriority.LOW:
        return "border-white/20 text-muted-foreground bg-white/5";
      case TaskPriority.MEDIUM:
        return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case TaskPriority.HIGH:
        return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case TaskPriority.CRITICAL:
        return "border-danger/50 text-danger bg-danger/10 animate-pulse";
      default:
        return "border-white/20 text-foreground bg-background";
    }
  }, [priority]);

  const label = priority.toLowerCase();

  return (
    <Badge variant="outline" className={`${styles} capitalize font-semibold`} aria-label={`Task priority: ${label}`}>
      {label}
    </Badge>
  );
}
