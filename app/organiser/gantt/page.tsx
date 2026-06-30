"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import LoadingAnimation from "@/components/shared/LoadingAnimation";
import { addDays, format, differenceInDays, subDays, parseISO } from "date-fns";
import { 
  Plus, Filter, Settings, Loader2, ChevronDown, ChevronRight, User, Circle,
  Calendar as CalendarIcon, ZoomIn, ZoomOut, Check, ArrowRight, RefreshCw,
  Edit2, Trash2, CheckSquare, Clock, AlertTriangle, FileSpreadsheet, Lock
} from "lucide-react";
import { GANTT_MASTER_DATA, RawGanttRow } from "@/lib/gantt_data";

interface GanttTaskData {
  id: string;
  assignedTo: { id: string; name: string } | null;
  assignedToId: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  progressPercent: number;
  dependsOnIds: string[];
  verticalId: string | null;
  eventId: string | null;
  
  // Custom metadata fields for dependency display
  duration?: number;
  predecessorId?: string | null;
  lag?: number;
  isFixedAnchor?: boolean;
  startOffset?: number | null;
}

interface GanttNode {
  id: string;
  type: "vertical" | "event" | "task";
  title: string;
  colorCode?: string;
  depth: number;
  parentId: string | null;
  children: GanttNode[];
  taskData?: GanttTaskData;
}

// Memory calculation engine for predecessors
function calculateGanttDates(rows: RawGanttRow[], festStartDate: Date): RawGanttRow[] {
  const computed: Record<string, RawGanttRow & { startDate?: Date; endDate?: Date }> = {};
  rows.forEach(r => {
    computed[r.id] = { ...r };
  });

  const resolving = new Set<string>();
  const resolved = new Set<string>();

  function resolveRow(id: string) {
    if (resolved.has(id)) return;
    if (resolving.has(id)) {
      console.warn("Circular dependency detected at task ID:", id);
      return;
    }
    resolving.add(id);

    const row = computed[id];
    if (!row) return;

    if (row.type === "sub-task") {
      let start: Date;
      if (row.isFixedAnchor && row.startOffset !== null && row.startOffset !== undefined) {
        start = addDays(festStartDate, row.startOffset);
      } else if (row.predecessorId) {
        resolveRow(row.predecessorId);
        const pred = computed[row.predecessorId];
        if (pred && pred.endDate) {
          start = addDays(pred.endDate, row.lag || 0);
        } else {
          start = festStartDate;
        }
      } else {
        start = festStartDate;
      }
      
      const duration = row.duration || 1;
      const end = addDays(start, Math.max(1, duration) - 1);
      row.startDate = start;
      row.endDate = end;
    }

    resolving.delete(id);
    resolved.add(id);
  }

  // Resolve sub-tasks first
  rows.forEach(r => {
    if (r.type === "sub-task") {
      resolveRow(r.id);
    }
  });

  // Roll up Task ranges (Parents of Sub-tasks)
  rows.forEach(r => {
    if (r.type === "task") {
      const children = Object.values(computed).filter(c => c.parentId === r.id);
      if (children.length > 0) {
        const starts = children.map(c => c.startDate).filter(Boolean) as Date[];
        const ends = children.map(c => c.endDate).filter(Boolean) as Date[];
        if (starts.length > 0 && ends.length > 0) {
          r.startDate = new Date(Math.min(...starts.map(d => d.getTime())));
          r.endDate = new Date(Math.max(...ends.map(d => d.getTime())));
        } else {
          r.startDate = festStartDate;
          r.endDate = festStartDate;
        }
      } else {
        r.startDate = festStartDate;
        r.endDate = festStartDate;
      }
    }
  });

  // Roll up Milestone ranges (Parents of Tasks)
  rows.forEach(r => {
    if (r.type === "milestone") {
      const children = Object.values(computed).filter(c => c.parentId === rowIdToParentId(c.id));
      if (children.length > 0) {
        const starts = children.map(c => c.startDate).filter(Boolean) as Date[];
        const ends = children.map(c => c.endDate).filter(Boolean) as Date[];
        if (starts.length > 0 && ends.length > 0) {
          r.startDate = new Date(Math.min(...starts.map(d => d.getTime())));
          r.endDate = new Date(Math.max(...ends.map(d => d.getTime())));
        } else {
          r.startDate = festStartDate;
          r.endDate = festStartDate;
        }
      } else {
        r.startDate = festStartDate;
        r.endDate = festStartDate;
      }
    }
  });

  return Object.values(computed) as any;
}

function rowIdToParentId(id: string): string | null {
  const parts = id.split(".");
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join(".");
}

export default function GanttPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "VOLUNTEER";
  const isOrganiserOrAdmin = userRole === "ADMIN";

  const [loading, setLoading] = React.useState(true);
  const [zoomLevel, setZoomLevel] = React.useState<"day" | "week" | "month">("week");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Master Fest Start Date configuration
  const [festStartDate, setFestStartDate] = React.useState<Date>(new Date("2027-11-06"));
  const [ganttRows, setGanttRows] = React.useState<any[]>(GANTT_MASTER_DATA);

  // Expanded nodes map
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  // Inline editing task title state
  const [editingNodeId, setEditingNodeId] = React.useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = React.useState("");

  // Modal State for adding task
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskParent, setNewTaskParent] = React.useState("");
  const [newTaskDuration, setNewTaskDuration] = React.useState("3");
  const [newTaskPredecessor, setNewTaskPredecessor] = React.useState("");
  const [newTaskLag, setNewTaskLag] = React.useState("1");
  const [newTaskIsAnchor, setNewTaskIsAnchor] = React.useState(false);
  const [newTaskOffset, setNewTaskOffset] = React.useState("-10");

  // Task details side sheet/overlay state
  const [selectedTask, setSelectedTask] = React.useState<GanttTaskData | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = React.useState(false);

  // Split-pane width state (resizing WBS panel)
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(380);
  const isResizingRef = React.useRef(false);

  // Dragging task bars state
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dragOffsetDays, setDragOffsetDays] = React.useState<number>(0);
  const [dragType, setDragType] = React.useState<"move" | "resize-right" | null>(null);
  const initialDragClientXRef = React.useRef<number>(0);
  const initialDragStartRef = React.useRef<Date | null>(null);
  const initialDragEndRef = React.useRef<Date | null>(null);

  const leftScrollRef = React.useRef<HTMLDivElement>(null);
  const rightScrollRef = React.useRef<HTMLDivElement>(null);

  // Dynamic WBS data calculations
  const computedRows = React.useMemo(() => {
    return calculateGanttDates(ganttRows, festStartDate);
  }, [ganttRows, festStartDate]);

  // Build the nested tree nodes
  const treeData = React.useMemo(() => {
    const milestones = computedRows.filter(r => r.type === "milestone");
    const tasks = computedRows.filter(r => r.type === "task");
    const subTasks = computedRows.filter(r => r.type === "sub-task");

    const milestoneColorCodes: Record<string, string> = {
      M1: "#E63946", M2: "#2A9D8F", M3: "#E9C46A", M4: "#264653",
      M5: "#F4A261", M6: "#8338EC", M7: "#3A86FF", M8: "#FF006E",
      M9: "#38B000", M10: "#7209B7", M11: "#FF70A6", M12: "#FF9F1C"
    };

    return milestones.map(m => {
      const mTasks = tasks.filter(t => t.parentId === m.id);
      
      return {
        id: m.id,
        type: "vertical",
        title: `${m.id}. ${m.name}`,
        colorCode: milestoneColorCodes[m.id] || "#3b82f6",
        depth: 0,
        parentId: null,
        children: mTasks.map(t => {
          const tSubs = subTasks.filter(s => s.parentId === t.id);
          
          return {
            id: t.id,
            type: "event",
            title: `${t.id} ${t.name}`,
            depth: 1,
            parentId: m.id,
            children: tSubs.map(s => ({
              id: s.id,
              type: "task",
              title: `${s.id} ${s.name}`,
              depth: 2,
              parentId: t.id,
              children: [],
              taskData: {
                id: s.id,
                assignedTo: s.owner ? { id: s.owner, name: s.owner } : null,
                assignedToId: s.owner || null,
                status: s.status || "NOT_STARTED",
                priority: s.priority || "MEDIUM",
                startDate: s.startDate ? s.startDate.toISOString() : null,
                endDate: s.endDate ? s.endDate.toISOString() : null,
                dueDate: s.endDate ? s.endDate.toISOString() : null,
                progressPercent: s.progressPercent || 0,
                dependsOnIds: s.predecessorId ? [s.predecessorId] : [],
                duration: s.duration,
                predecessorId: s.predecessorId,
                lag: s.lag,
                isFixedAnchor: s.isFixedAnchor,
                startOffset: s.startOffset
              }
            }))
          };
        })
      };
    });
  }, [computedRows]);

  React.useEffect(() => {
    // Simulate loading on mount
    const timer = setTimeout(() => {
      setLoading(false);
      // Expand M1 and M2 by default
      setExpandedIds(new Set(["M1", "M1.T1", "M1.T2", "M1.T3", "M2", "M2.T1", "M2.T2"]));
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Sync scroll
  const handleLeftScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  };

  const handleRightScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const flattenTree = (nodes: any[]): any[] => {
    const list: any[] = [];
    
    function recurse(n: any) {
      const matchesSearch = !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      let satisfiesFilters = true;
      if (n.type === "task" && n.taskData) {
        const matchesStatus = statusFilter === "all" || n.taskData.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || n.taskData.priority === priorityFilter;
        satisfiesFilters = matchesStatus && matchesPriority;
      }

      if (satisfiesFilters) {
        list.push(n);
      }

      const isExpanded = expandedIds.has(n.id);
      if (isExpanded && n.children && n.children.length > 0) {
        n.children.forEach(recurse);
      }
    }

    nodes.forEach(recurse);
    return list;
  };

  const flatNodes = flattenTree(treeData);

  // Map of taskId to WBS index
  const taskIdToIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    flatNodes.forEach((node, index) => {
      map.set(node.id, index);
    });
    return map;
  }, [flatNodes]);

  // Constants for timeline
  const timelineStart = React.useMemo(() => addDays(festStartDate, -160), [festStartDate]);
  const totalTimelineDays = 210; // Spans from -160 to +50 days

  const dayWidth = React.useMemo(() => {
    switch (zoomLevel) {
      case "day": return 60;
      case "week": return 25;
      case "month": return 8;
    }
  }, [zoomLevel]);

  const timelineDays = React.useMemo(() => {
    return Array.from({ length: totalTimelineDays }).map((_, i) => addDays(timelineStart, i));
  }, [timelineStart]);

  function getStatusColor(status: string): string {
    switch (status) {
      case "IN_PROGRESS": return "bg-blue-500 border-blue-400";
      case "COMPLETED": return "bg-emerald-500 border-emerald-400";
      case "DELAYED": return "bg-rose-500 border-rose-400";
      case "BLOCKED": return "bg-amber-600 border-amber-500";
      default: return "bg-slate-500 border-slate-400";
    }
  }

  // Inline edit task title
  const handleDoubleClickTitle = (node: any) => {
    if (!isOrganiserOrAdmin) return;
    setEditingNodeId(node.id);
    setEditingTitleValue(node.title.replace(/^[\w\.\d]+\s+/, ""));
  };

  const handleSaveTitleInline = (nodeId: string) => {
    if (!editingTitleValue.trim()) return;
    setGanttRows(prev => {
      return prev.map(r => {
        if (r.id === nodeId) {
          return { ...r, name: editingTitleValue };
        }
        return r;
      });
    });
    setEditingNodeId(null);
  };

  // WBS Split Pane Resizer Handlers
  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMoveResizer);
    document.addEventListener("mouseup", handleMouseUpResizer);
  };

  const handleMouseMoveResizer = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = Math.max(220, Math.min(600, e.clientX));
    setLeftPanelWidth(newWidth);
  };

  const handleMouseUpResizer = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMoveResizer);
    document.removeEventListener("mouseup", handleMouseUpResizer);
  };

  // Drag-to-Move or Drag-to-Resize Task Bars on Timeline Handlers
  const handleMouseDownBar = (
    e: React.MouseEvent,
    task: GanttTaskData,
    type: "move" | "resize-right"
  ) => {
    if (!isOrganiserOrAdmin) return;
    e.stopPropagation();
    e.preventDefault();

    setDraggedTaskId(task.id);
    setDragType(type);
    setDragOffsetDays(0);
    initialDragClientXRef.current = e.clientX;
    initialDragStartRef.current = task.startDate ? parseISO(task.startDate) : new Date();
    initialDragEndRef.current = task.endDate ? parseISO(task.endDate) : new Date();

    document.addEventListener("mousemove", handleMouseMoveBar);
    document.addEventListener("mouseup", handleMouseUpBar);
  };

  const handleMouseMoveBar = (e: MouseEvent) => {
    if (!draggedTaskId || !initialDragStartRef.current || !initialDragEndRef.current) return;

    const deltaX = e.clientX - initialDragClientXRef.current;
    const deltaDays = Math.round(deltaX / dayWidth);
    setDragOffsetDays(deltaDays);
  };

  const handleMouseUpBar = () => {
    if (draggedTaskId) {
      setGanttRows(prev => {
        return prev.map(r => {
          if (r.id !== draggedTaskId) return r;
          
          if (dragType === "resize-right") {
            const newDur = Math.max(1, (r.duration || 1) + dragOffsetDays);
            return { ...r, duration: newDur };
          } else {
            if (r.isFixedAnchor) {
              return { ...r, startOffset: (r.startOffset || 0) + dragOffsetDays };
            } else {
              return { ...r, lag: (r.lag || 0) + dragOffsetDays };
            }
          }
        });
      });
    }

    setDraggedTaskId(null);
    setDragType(null);
    setDragOffsetDays(0);
    document.removeEventListener("mousemove", handleMouseMoveBar);
    document.removeEventListener("mouseup", handleMouseUpBar);
  };

  // Add Task to Tree State
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskParent) return;

    const isAnchor = newTaskIsAnchor;
    const offset = parseInt(newTaskOffset) || 0;
    const duration = parseInt(newTaskDuration) || 1;
    const lag = parseInt(newTaskLag) || 0;
    
    // Find next sub-task ID
    const parentNode = computedRows.find(r => r.id === newTaskParent);
    if (!parentNode) return;

    const existingSiblings = computedRows.filter(r => r.parentId === parentNode.id);
    const subIdx = existingSiblings.length + 1;
    const newId = `${parentNode.id}.S${subIdx}`;

    const newRow: RawGanttRow = {
      id: newId,
      name: newTaskTitle,
      owner: "Custom",
      type: "sub-task",
      parentId: parentNode.id,
      duration,
      isFixedAnchor: isAnchor,
      startOffset: isAnchor ? offset : null,
      predecessorId: !isAnchor && newTaskPredecessor ? newTaskPredecessor : null,
      lag: !isAnchor && newTaskPredecessor ? lag : null,
    };

    setGanttRows(prev => [...prev, newRow]);

    // Reset Form
    setNewTaskTitle("");
    setNewTaskParent("");
    setNewTaskDuration("3");
    setNewTaskPredecessor("");
    setNewTaskLag("1");
    setNewTaskIsAnchor(false);
    setNewTaskOffset("-10");
    setIsAddModalOpen(false);
  };

  const handleOpenDetails = (task: GanttTaskData) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleExpandAll = () => {
    const allExpanded = new Set<string>();
    computedRows.forEach(r => {
      if (r.type !== "sub-task") {
        allExpanded.add(r.id);
      }
    });
    setExpandedIds(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // HTML Styled Excel Document Exporter
  const handleExportExcel = () => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<style>
  table { border-collapse: collapse; margin-top: 10px; }
  th { background-color: #0b1329; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; font-family: 'Segoe UI', sans-serif; font-size: 10.5pt; }
  td { border: 1px solid #cbd5e1; padding: 6px; font-family: 'Segoe UI', sans-serif; font-size: 9.5pt; }
  tr.milestone { background-color: #0b1329; color: #ffffff; font-weight: bold; }
  tr.task { background-color: #e0f2fe; color: #0369a1; font-weight: bold; }
  tr.subtask { background-color: #ffffff; color: #334155; }
  td.indent { text-indent: 15px; font-weight: bold; }
  td.double-indent { text-indent: 30px; }
  .title-cell { font-weight: bold; color: #b91c1c; font-size: 14pt; }
</style>
</head>
<body>
  <table>
    <tr>
      <td colspan="4" class="title-cell">USHUS Fest Master Gantt Chart</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td style="font-weight: bold;">Fest Start Date:</td>
      <td style="vnd.ms-excel.numberformat:yyyy-mm-dd; font-weight: bold; color: #b91c1c;">${format(festStartDate, "yyyy-MM-dd")}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr><td colspan="7"></td></tr>
    <tr>
      <th>WBS ID</th>
      <th>Task Name</th>
      <th>Owner / Vertical</th>
      <th>Duration (Days)</th>
      <th>Start Date</th>
      <th>End Date</th>
      <th>Dependency Details</th>
    </tr>`;

    // Row mappings to write formulas in Excel
    const startRowIdx = 5;
    const rowMap: Record<string, number> = {};
    computedRows.forEach((r, i) => {
      rowMap[r.id] = startRowIdx + i;
    });

    computedRows.forEach((row, idx) => {
      const excelRow = startRowIdx + idx;
      let rowClass = "subtask";
      let indentClass = "double-indent";
      if (row.type === "milestone") {
        rowClass = "milestone";
        indentClass = "";
      } else if (row.type === "task") {
        rowClass = "task";
        indentClass = "indent";
      }

      let startFormula = "";
      let endFormula = "";

      if (row.type === "milestone" || row.type === "task") {
        const children = computedRows.filter(c => c.parentId === row.id || (row.type === "milestone" && rowIdToParentId(c.id) === row.id));
        if (children.length > 0) {
          const firstChildIdx = rowMap[children[0].id];
          const lastChildIdx = rowMap[children[children.length - 1].id];
          startFormula = `=MIN(E${firstChildIdx}:E${lastChildIdx})`;
          endFormula = `=MAX(F${firstChildIdx}:F${lastChildIdx})`;
        } else {
          startFormula = "=$B$2";
          endFormula = "=$B$2";
        }
      } else {
        if (row.isFixedAnchor && row.startOffset !== null && row.startOffset !== undefined) {
          const sign = row.startOffset >= 0 ? "+" : "";
          startFormula = `=$B$2${sign}${row.startOffset}`;
        } else if (row.predecessorId && rowMap[row.predecessorId]) {
          const predExcelRow = rowMap[row.predecessorId];
          startFormula = `=F${predExcelRow}+${row.lag || 0}`;
        } else {
          startFormula = "=$B$2";
        }
        endFormula = `=E${excelRow}+D${excelRow}-1`;
      }

      html += `
    <tr class="${rowClass}">
      <td>${row.id}</td>
      <td class="${indentClass}">${row.name}</td>
      <td>${row.owner || ""}</td>
      <td x:num>${row.type === "sub-task" ? row.duration : ""}</td>
      <td style="vnd.ms-excel.numberformat:yyyy-mm-dd">${startFormula}</td>
      <td style="vnd.ms-excel.numberformat:yyyy-mm-dd">${endFormula}</td>
      <td>${
        row.isFixedAnchor 
          ? `Fest${row.startOffset !== undefined && row.startOffset !== null && row.startOffset >= 0 ? "+" : ""}${row.startOffset ?? ""}d (fixed anchor)`
          : row.predecessorId 
            ? `after ${row.predecessorId}${row.lag && row.lag >= 0 ? "+" : ""}${row.lag}d` 
            : ""
      }</td>
    </tr>`;
    });

    html += `
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `USHUS_Gantt_Master_${format(festStartDate, "yyyy-MM-dd")}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rowHeight = 44;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation message="Recalculating WBS constraints..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8.5rem)] relative">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-50">Constellation Timeline</h1>
          <p className="text-muted-foreground mt-1">Hierarchical project WBS mapping & dynamic Excel-linked Gantt chart.</p>
        </div>
        
        {/* Upper Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Master Fest Date setting */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <label className="text-xs font-semibold text-indigo-300">Fest Start Date:</label>
            <Input
              type="date"
              className="w-36 bg-[#0b0f19] border-white/10 text-xs h-7 py-0"
              value={format(festStartDate, "yyyy-MM-dd")}
              onChange={(e) => {
                const newDate = parseISO(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  setFestStartDate(newDate);
                }
              }}
            />
          </div>

          {/* Legend */}
          <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/10 rounded-lg p-2 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#0b1329] border border-slate-700" />
              <span className="text-muted-foreground font-semibold">Milestone</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#0284c7]/20 border border-[#0284c7]/50" />
              <span className="text-muted-foreground font-semibold">Task</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300" />
              <span className="text-muted-foreground font-semibold">Sub-task</span>
            </span>
          </div>

          {/* Zoom Selector */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            {(["day", "week", "month"] as const).map(zoom => (
              <button
                key={zoom}
                onClick={() => setZoomLevel(zoom)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  zoomLevel === zoom 
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {zoom}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-[#0b0f19]/80 border-white/10 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0f19] border-white/10">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 bg-[#0b0f19]/80 border-white/10 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0f19] border-white/10">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 text-xs h-9 px-3" onClick={handleExpandAll}>
              Expand All
            </Button>
            <Button variant="outline" className="border-white/10 text-xs h-9 px-3" onClick={handleCollapseAll}>
              Collapse All
            </Button>

            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] text-xs h-9" 
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Export Excel
            </Button>
            
            {isOrganiserOrAdmin && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] text-xs h-9">
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-white/15 max-w-lg bg-[#0b0f19]/95 text-foreground backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Create Schedule Sub-task</DialogTitle>
                    <DialogDescription>Add a deliverables node to a parent Task WBS branch.</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Sub-task Title</label>
                      <Input
                        required
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Onboard cafeteria vendors"
                        className="bg-background/50 border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Parent Task</label>
                      <Select value={newTaskParent} onValueChange={setNewTaskParent}>
                        <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                          <SelectValue placeholder="Select Parent Task" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b0f19] border-white/10">
                          {computedRows
                            .filter(r => r.type === "task")
                            .map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.id} {t.name}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Duration (Days)</label>
                        <Input
                          type="number"
                          value={newTaskDuration}
                          onChange={e => setNewTaskDuration(e.target.value)}
                          className="bg-background/50 border-white/10 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">SLA Rule Anchor type</label>
                        <Select 
                          value={newTaskIsAnchor ? "anchor" : "predecessor"} 
                          onValueChange={(val) => setNewTaskIsAnchor(val === "anchor")}
                        >
                          <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0f19] border-white/10">
                            <SelectItem value="predecessor">Linked to Predecessor</SelectItem>
                            <SelectItem value="anchor">Fixed Fest Date Offset</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newTaskIsAnchor ? (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Fixed Anchor Offset (Days relative to Fest Start)</label>
                        <Input
                          type="number"
                          placeholder="e.g. -150 for 150 days before"
                          value={newTaskOffset}
                          onChange={e => setNewTaskOffset(e.target.value)}
                          className="bg-background/50 border-white/10 text-xs"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Predecessor Sub-task</label>
                          <Select value={newTaskPredecessor} onValueChange={setNewTaskPredecessor}>
                            <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                              <SelectValue placeholder="Select Predecessor" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0b0f19] border-white/10">
                              {computedRows
                                .filter(r => r.type === "sub-task")
                                .map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.id} {s.name}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Lag Days</label>
                          <Input
                            type="number"
                            value={newTaskLag}
                            onChange={e => setNewTaskLag(e.target.value)}
                            className="bg-background/50 border-white/10 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                      <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Create Deliverable
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Main Gantt Split-Pane Interface */}
      <Card className="glass border-white/10 flex-1 overflow-hidden flex flex-col min-h-0 bg-background/5">
        <CardContent className="p-0 flex-1 overflow-hidden flex relative select-none">
          
          {/* Split Pane: Left Tree Panel */}
          <div 
            className="shrink-0 border-r border-white/10 flex flex-col h-full overflow-hidden bg-white/[0.01] relative z-10"
            style={{ width: leftPanelWidth }}
          >
            <div className="h-12 border-b border-white/10 p-3 font-semibold text-xs uppercase tracking-wider flex items-center bg-white/[0.02] shrink-0 text-indigo-200">
              WBS Tree Nodes
            </div>
            
            <div 
              ref={leftScrollRef}
              onScroll={handleLeftScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-white/5 custom-scrollbar"
            >
              {flatNodes.map((node) => {
                const isMilestone = node.type === "vertical";
                const isTask = node.type === "event";
                const isSubtask = node.type === "task";

                return (
                  <div 
                    key={node.id}
                    className={`h-[44px] flex items-center justify-between px-3 border-b border-white/5 transition-colors group relative ${
                      isMilestone ? "bg-[#0b1329]/60 text-white font-bold" :
                      isTask ? "bg-[#0284c7]/5 text-[#38bdf8] font-semibold" :
                      "bg-transparent text-slate-300 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {/* Expand / Collapse arrows */}
                      {!isSubtask ? (
                        <button 
                          onClick={() => toggleExpand(node.id)}
                          className="p-0.5 rounded hover:bg-white/10 text-muted-foreground focus:outline-none"
                        >
                          {expandedIds.has(node.id) ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <div className="w-4.5" />
                      )}

                      {/* Tree hierarchy indentation prefix */}
                      <span className="text-[11px] font-mono shrink-0 select-none opacity-60">
                        {node.id}
                      </span>

                      {/* Editable Task Title */}
                      {editingNodeId === node.id ? (
                        <Input
                          autoFocus
                          className="h-6 py-0 px-1 text-[11px] bg-background/80 border-indigo-500/50 text-foreground w-full"
                          value={editingTitleValue}
                          onChange={e => setEditingTitleValue(e.target.value)}
                          onBlur={() => handleSaveTitleInline(node.id)}
                          onKeyDown={e => e.key === "Enter" && handleSaveTitleInline(node.id)}
                        />
                      ) : (
                        <span 
                          onDoubleClick={() => handleDoubleClickTitle(node)}
                          className={`text-[11px] truncate cursor-text ${
                            isSubtask ? "hover:underline" : ""
                          }`}
                          title={isSubtask ? "Double click to edit title" : ""}
                        >
                          {node.title.replace(/^[\w\.\d]+\s+/, "")}
                        </span>
                      )}
                    </div>

                    {/* Owner / vertical indicator */}
                    {isSubtask && node.taskData?.assignedTo && (
                      <Badge variant="outline" className="text-[8px] py-0 border-white/10 text-muted-foreground bg-white/5">
                        {node.taskData.assignedTo.name}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resizer Handle */}
          <div 
            onMouseDown={handleMouseDownResizer}
            className="w-1.5 shrink-0 bg-white/5 border-l border-r border-white/10 cursor-col-resize hover:bg-indigo-500/40 transition-colors z-20"
          />

          {/* Split Pane: Right Timeline Panel */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
            {/* Timeline Days Header (Horizontal Scrolling Header) */}
            <div className="h-12 border-b border-white/10 flex bg-white/[0.01] shrink-0 overflow-hidden relative">
              <div 
                className="flex absolute left-0 top-0 h-full"
                style={{ width: timelineDays.length * dayWidth }}
              >
                {timelineDays.map((day, i) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isTodayDate = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

                  return (
                    <div 
                      key={i} 
                      className={`shrink-0 border-r border-white/5 flex flex-col items-center justify-center p-1 relative h-full ${
                        isTodayDate ? "bg-indigo-500/5" : ""
                      }`}
                      style={{ width: dayWidth }}
                    >
                      <span className="text-[8px] tracking-wider text-muted-foreground font-semibold uppercase">{format(day, 'MMM')}</span>
                      <span className={`text-[11px] ${
                        isTodayDate ? 'text-indigo-400 font-bold' : 
                        isWeekend ? 'text-amber-500/75' : 'text-foreground/90'
                      }`}>
                        {format(day, 'dd')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Timeline Grid Container */}
            <div 
              ref={rightScrollRef}
              onScroll={handleRightScroll}
              className="flex-1 overflow-auto custom-scrollbar relative bg-white/[0.005]"
            >
              {/* Timeline Grid Body */}
              <div 
                className="relative min-h-full divide-y divide-white/5"
                style={{ width: timelineDays.length * dayWidth }}
              >
                
                {/* SVG Dependency Line Connector Layer */}
                <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="rgba(129, 140, 248, 0.4)" />
                    </marker>
                  </defs>

                  {flatNodes.map((node, nodeIdx) => {
                    if (node.type !== "task" || !node.taskData?.dependsOnIds) return null;
                    
                    return node.taskData.dependsOnIds.map((predId: string) => {
                      const predIdx = taskIdToIndexMap.get(predId);
                      if (predIdx === undefined) return null;

                      const predNode = flatNodes[predIdx];
                      if (!predNode.taskData?.startDate || !predNode.taskData?.endDate) return null;
                      const pStart = parseISO(predNode.taskData.startDate);
                      const pEnd = parseISO(predNode.taskData.endDate);
                      const pLeft = differenceInDays(pStart, timelineStart) * dayWidth;
                      const pWidth = (differenceInDays(pEnd, pStart) + 1) * dayWidth;
                      
                      const x1 = pLeft + pWidth;
                      const y1 = predIdx * rowHeight + rowHeight / 2;

                      if (!node.taskData?.startDate || !node.taskData?.endDate) return null;
                      const sStart = parseISO(node.taskData.startDate);
                      const sLeft = differenceInDays(sStart, timelineStart) * dayWidth;

                      const x2 = sLeft;
                      const y2 = nodeIdx * rowHeight + rowHeight / 2;

                      return (
                        <path
                          key={`${node.id}-${predId}`}
                          d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                          stroke="rgba(129, 140, 248, 0.35)"
                          strokeWidth="1.5"
                          fill="none"
                          markerEnd="url(#arrow)"
                        />
                      );
                    });
                  })}
                </svg>

                {/* Timeline Grid Rows */}
                {flatNodes.map((node, idx) => {
                  const taskStart = node.taskData?.startDate ? parseISO(node.taskData.startDate) : null;
                  const taskEnd = node.taskData?.endDate ? parseISO(node.taskData.endDate) : null;

                  let left = 0;
                  let width = 0;

                  if (taskStart && taskEnd) {
                    let calcStart = taskStart;
                    let calcEnd = taskEnd;

                    if (draggedTaskId === node.id && node.taskData) {
                      if (dragType === "move") {
                        calcStart = addDays(taskStart, dragOffsetDays);
                        calcEnd = addDays(taskEnd, dragOffsetDays);
                      } else if (dragType === "resize-right") {
                        calcEnd = addDays(taskEnd, dragOffsetDays);
                        if (calcEnd < calcStart) calcEnd = calcStart;
                      }
                    }

                    const startDiff = differenceInDays(calcStart, timelineStart);
                    const duration = differenceInDays(calcEnd, calcStart) + 1;
                    left = startDiff * dayWidth;
                    width = duration * dayWidth;
                  }

                  return (
                    <div 
                      key={node.id}
                      className={`h-[44px] relative flex items-center ${
                        node.type === "vertical" ? "bg-indigo-500/5" :
                        node.type === "event" ? "bg-[#0284c7]/5" : ""
                      }`}
                    >
                      {/* Day Grid Lines */}
                      <div className="absolute inset-0 flex pointer-events-none z-0">
                        {timelineDays.map((_, i) => (
                          <div key={i} className="h-full border-r border-white/5 shrink-0" style={{ width: dayWidth }} />
                        ))}
                      </div>

                      {/* Timeline Task/Summary Bar */}
                      {width > 0 && node.taskData && (
                        <div 
                          onClick={() => handleOpenDetails(node.taskData!)}
                          className={`absolute h-7 rounded-md border flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.4)] px-2.5 group cursor-pointer transition-all ${
                            node.type === "vertical" 
                              ? "bg-slate-900 border-slate-700 text-white font-bold" 
                              : node.type === "event" 
                                ? "bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold" 
                                : getStatusColor(node.taskData.status)
                          }`}
                          style={{ left, width }}
                          onMouseDown={(e) => {
                            if (node.type === "task") {
                              handleMouseDownBar(e, node.taskData!, "move");
                            }
                          }}
                          title={node.type === "task" ? "Click to view details. Drag to reschedule." : "Rollup summary bar."}
                        >
                          {/* Completion Progress Bar Overlay */}
                          {node.type === "task" && (
                            <div 
                              className="absolute top-0 bottom-0 left-0 bg-black/25 pointer-events-none rounded-l-md"
                              style={{ width: `${node.taskData.progressPercent}%` }}
                            />
                          )}

                          <div className="relative z-10 flex items-center gap-1.5 min-w-0 select-none">
                            <span className={`text-[10px] truncate ${node.type === "vertical" ? "text-slate-200" : node.type === "event" ? "text-sky-200" : "text-white"}`}>
                              {node.title}
                            </span>
                            {node.type === "task" && (
                              <span className="text-[9px] text-white/70 font-semibold">
                                ({node.taskData.progressPercent}%)
                              </span>
                            )}
                          </div>

                          {/* Resize handle (right edge of bar) */}
                          {isOrganiserOrAdmin && node.type === "task" && (
                            <div 
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/30 hover:bg-white/50 rounded-r-md transition-opacity"
                              onMouseDown={(e) => handleMouseDownBar(e, node.taskData!, "resize-right")}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Task Details Side Overlay Sheet */}
      <AnimatePresence>
        {isTaskDetailsOpen && selectedTask && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskDetailsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-[#0b0f19]/95 border-l border-white/10 shadow-2xl backdrop-blur-xl z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h3 className="font-bold text-lg text-indigo-50">Task Details</h3>
                <Button variant="ghost" className="p-1 h-auto" onClick={() => setIsTaskDetailsOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pt-6 space-y-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${getStatusColor(selectedTask.status).split(" ")[0]}`} />
                    <span className="text-sm font-semibold">{selectedTask.status}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/5">
                      {selectedTask.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline Period</label>
                  <p className="text-sm mt-1 text-foreground">
                    {selectedTask.startDate ? format(parseISO(selectedTask.startDate), "MMM dd, yyyy") : "TBD"} — {selectedTask.endDate ? format(parseISO(selectedTask.endDate), "MMM dd, yyyy") : "TBD"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</label>
                  <p className="text-sm mt-1 text-foreground font-mono">{selectedTask.duration} Days</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Predecessor Dependency</label>
                  <p className="text-sm mt-1 text-foreground">
                    {selectedTask.isFixedAnchor 
                      ? "Locked to master Fest start date"
                      : selectedTask.predecessorId 
                        ? `Starts after ${selectedTask.predecessorId} (+ ${selectedTask.lag} days lag)`
                        : "None"
                    }
                  </p>
                </div>

                {selectedTask.assignedTo && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vertical / Owner</label>
                    <p className="text-sm mt-1 text-foreground">{selectedTask.assignedTo.name}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
