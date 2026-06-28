import * as React from "react";
import { TaskStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = React.useMemo(() => {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return "border-white/20 text-muted-foreground bg-white/5";
      case TaskStatus.IN_PROGRESS:
        return "border-indigo-500/50 text-indigo-400 bg-indigo-500/10";
      case TaskStatus.COMPLETED:
        return "border-success/50 text-success bg-success/10";
      case TaskStatus.DELAYED:
        return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case TaskStatus.BLOCKED:
        return "border-danger/50 text-danger bg-danger/10";
      default:
        return "border-white/20 text-foreground bg-background";
    }
  }, [status]);

  const label = status.replace("_", " ").toLowerCase();

  return (
    <Badge variant="outline" className={`${styles} capitalize font-medium`} aria-label={`Task status: ${label}`}>
      {label}
    </Badge>
  );
}
