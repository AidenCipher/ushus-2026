"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addDays, format, differenceInDays, subDays, parseISO } from "date-fns";
import { 
  Plus, Filter, Settings, Loader2, ChevronDown, ChevronRight, User, Circle,
  Calendar as CalendarIcon, ZoomIn, ZoomOut, Check, ArrowRight, RefreshCw,
  Edit2, Trash2, CheckSquare, Clock, AlertTriangle, Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

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

export default function GanttPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "VOLUNTEER";
  const isOrganiserOrAdmin = ["ORGANISER", "ADMIN"].includes(userRole);

  const [loading, setLoading] = React.useState(true);
  const [treeData, setTreeData] = React.useState<GanttNode[]>([]);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  
  // View options & zoom levels
  const [zoomLevel, setZoomLevel] = React.useState<"day" | "week" | "month">("week");
  const [viewFilter, setViewFilter] = React.useState<"all" | "vertical" | "event" | "my">("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");

  // Inline editing task title state
  const [editingNodeId, setEditingNodeId] = React.useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = React.useState("");

  // Modal State for adding task
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDesc, setNewTaskDesc] = React.useState("");
  const [newTaskVertical, setNewTaskVertical] = React.useState("");
  const [newTaskEvent, setNewTaskEvent] = React.useState("");
  const [newTaskAssignee, setNewTaskAssignee] = React.useState("");
  const [newTaskStart, setNewTaskStart] = React.useState("");
  const [newTaskEnd, setNewTaskEnd] = React.useState("");
  const [newTaskPriority, setNewTaskPriority] = React.useState("MEDIUM");
  const [newTaskStatus, setNewTaskStatus] = React.useState("NOT_STARTED");
  const [newTaskDependsOn, setNewTaskDependsOn] = React.useState<string[]>([]);
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Metadata catalogs
  const [verticals, setVerticals] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [submittingTask, setSubmittingTask] = React.useState(false);

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

  // Timeline start/end dates
  const timelineStart = React.useMemo(() => subDays(new Date(), 15), []);
  
  const dayWidth = React.useMemo(() => {
    switch (zoomLevel) {
      case "day": return 90;
      case "week": return 55;
      case "month": return 18;
    }
  }, [zoomLevel]);

  const totalTimelineDays = React.useMemo(() => {
    switch (zoomLevel) {
      case "day": return 45;
      case "week": return 75;
      case "month": return 120;
    }
  }, [zoomLevel]);

  const timelineDays = React.useMemo(() => {
    return Array.from({ length: totalTimelineDays }).map((_, i) => addDays(timelineStart, i));
  }, [timelineStart, totalTimelineDays]);

  const leftScrollRef = React.useRef<HTMLDivElement>(null);
  const rightScrollRef = React.useRef<HTMLDivElement>(null);

  // Fetch catalogs for task creator
  const fetchCatalogs = React.useCallback(async () => {
    try {
      const [vRes, eRes, uRes] = await Promise.all([
        fetch("/api/v1/verticals"),
        fetch("/api/v1/events"),
        fetch("/api/v1/users")
      ]);
      if (vRes.ok) {
        const json = await vRes.json();
        setVerticals(json.data || []);
      }
      if (eRes.ok) {
        const json = await eRes.json();
        setEvents(json.data || []);
      }
      if (uRes.ok) {
        const json = await uRes.json();
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load catalogs:", err);
    }
  }, []);

  const fetchGanttData = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/gantt?view=${viewFilter}`);
      if (res.ok) {
        const json = await res.json();
        setTreeData(json.data || []);
        
        // Expand everything initially
        const defaultExpanded = new Set<string>();
        function getExpandedIds(nodes: GanttNode[]) {
          nodes.forEach(n => {
            if (n.type !== "task") {
              defaultExpanded.add(n.id);
            }
            if (n.children) getExpandedIds(n.children);
          });
        }
        getExpandedIds(json.data || []);
        setExpandedIds(defaultExpanded);
      }
    } catch (err) {
      console.error("Failed to load Gantt data:", err);
    } finally {
      setLoading(false);
    }
  }, [viewFilter]);

  React.useEffect(() => {
    fetchGanttData();
    fetchCatalogs();
  }, [fetchGanttData, fetchCatalogs]);

  // Synchronize WBS panel and timeline scrolling
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

  // Flatten tree structure based on expand/collapse and filters
  const flattenTree = (nodes: GanttNode[]): GanttNode[] => {
    const list: GanttNode[] = [];
    
    function recurse(n: GanttNode) {
      // Apply filters to tasks
      if (n.type === "task" && n.taskData) {
        const matchesStatus = statusFilter === "all" || n.taskData.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || n.taskData.priority === priorityFilter;
        if (!matchesStatus || !matchesPriority) return;
      }

      list.push(n);
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
      if (node.type === "task") {
        map.set(node.id, index);
      }
    });
    return map;
  }, [flatNodes]);

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
  const handleDoubleClickTitle = (node: GanttNode) => {
    if (!isOrganiserOrAdmin || node.type !== "task") return;
    setEditingNodeId(node.id);
    let title = node.title;
    if (title.startsWith("[Schedule] ")) {
      title = title.substring("[Schedule] ".length);
    }
    setEditingTitleValue(title);
  };

  const handleSaveTitleInline = async (nodeId: string) => {
    if (!editingTitleValue.trim()) return;
    try {
      const isCE = nodeId.startsWith("ce_");
      const url = isCE
        ? `/api/v1/calendar/${nodeId.substring(3)}`
        : `/api/v1/tasks/${nodeId}`;
      const payload = isCE
        ? { title: editingTitleValue }
        : { title: editingTitleValue };

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingNodeId(null);
        await fetchGanttData();
      }
    } catch (err) {
      console.error("Inline save task title failed:", err);
    }
  };

  // Rescheduling handler called after drag/resize finishes
  async function handleTaskDateChange(taskId: string, start: Date, end: Date) {
    try {
      const isCE = taskId.startsWith("ce_");
      const url = isCE
        ? `/api/v1/calendar/${taskId.substring(3)}`
        : `/api/v1/tasks/${taskId}`;
      const payload = isCE
        ? {
            startDatetime: start.toISOString(),
            endDatetime: end.toISOString(),
          }
        : {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            dueDate: end.toISOString(),
          };

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchGanttData();
      }
    } catch (err) {
      console.error("Rescheduling task failed:", err);
    }
  }

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

  const handleMouseUpBar = async () => {
    if (draggedTaskId && initialDragStartRef.current && initialDragEndRef.current) {
      let finalStart = initialDragStartRef.current;
      let finalEnd = initialDragEndRef.current;

      if (dragType === "move") {
        finalStart = addDays(initialDragStartRef.current, dragOffsetDays);
        finalEnd = addDays(initialDragEndRef.current, dragOffsetDays);
      } else if (dragType === "resize-right") {
        finalEnd = addDays(initialDragEndRef.current, dragOffsetDays);
        if (finalEnd < finalStart) {
          finalEnd = finalStart;
        }
      }

      await handleTaskDateChange(draggedTaskId, finalStart, finalEnd);
    }

    setDraggedTaskId(null);
    setDragType(null);
    setDragOffsetDays(0);
    document.removeEventListener("mousemove", handleMouseMoveBar);
    document.removeEventListener("mouseup", handleMouseUpBar);
  };

  // Form task creation logic
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskVertical || !newTaskEvent) {
      setModalError("Title, Vertical, and Event are required");
      return;
    }
    setSubmittingTask(true);
    setModalError(null);

    try {
      const payload = {
        title: newTaskTitle,
        description: newTaskDesc || undefined,
        verticalId: newTaskVertical,
        eventId: newTaskEvent,
        assignedToId: newTaskAssignee || undefined,
        startDate: newTaskStart ? new Date(newTaskStart).toISOString() : undefined,
        endDate: newTaskEnd ? new Date(newTaskEnd).toISOString() : undefined,
        dueDate: newTaskEnd ? new Date(newTaskEnd).toISOString() : undefined,
        priority: newTaskPriority,
        status: newTaskStatus,
        dependsOnIds: newTaskDependsOn,
      };

      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskVertical("");
        setNewTaskEvent("");
        setNewTaskAssignee("");
        setNewTaskStart("");
        setNewTaskEnd("");
        setNewTaskDependsOn([]);
        await fetchGanttData();
      } else {
        setModalError(json.error || "Failed to create task");
      }
    } catch (err) {
      setModalError("Network connection error");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleOpenDetails = (task: GanttTaskData) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleExpandAll = () => {
    const allExpanded = new Set<string>();
    function getExpandedIds(nodes: GanttNode[]) {
      nodes.forEach(n => {
        if (n.type !== "task") {
          allExpanded.add(n.id);
        }
        if (n.children) getExpandedIds(n.children);
      });
    }
    getExpandedIds(treeData);
    setExpandedIds(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation message="Syncing timeline node map..." />
      </div>
    );
  }

  // Helper values for drawing SVG lines
  const rowHeight = 44;
  const headerHeight = 48;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8.5rem)] relative">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-50">Constellation Timeline</h1>
          <p className="text-muted-foreground mt-1">Hierarchical project work breakdown structure & live interactive Gantt chart.</p>
        </div>
        
        {/* Upper Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Zoom Selector */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            {(["day", "week", "month"] as const).map(zoom => (
              <button
                key={zoom}
                onClick={() => setZoomLevel(zoom)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  zoomLevel === zoom 
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {zoom}
              </button>
            ))}
          </div>

          {/* Scope Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-[#0b0f19]/80 border-white/10 text-xs">
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

            <Select value={priorityFilter} onValueChange={priorityFilter => setPriorityFilter(priorityFilter)}>
              <SelectTrigger className="w-36 bg-[#0b0f19]/80 border-white/10 text-xs">
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

            <Select value={viewFilter} onValueChange={v => setViewFilter(v as any)}>
              <SelectTrigger className="w-36 bg-[#0b0f19]/80 border-white/10 text-xs">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b0f19] border-white/10">
                <SelectItem value="all">All Verticals</SelectItem>
                <SelectItem value="vertical">My Vertical</SelectItem>
                <SelectItem value="event">My Event</SelectItem>
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
            
            {isOrganiserOrAdmin && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] text-xs h-9">
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-white/15 max-w-lg bg-[#0b0f19]/95 text-foreground backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Create Schedule Task</DialogTitle>
                    <DialogDescription>Add a deliverables node to the Work Breakdown Structure.</DialogDescription>
                  </DialogHeader>
                  
                  {modalError && (
                    <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-md">
                      {modalError}
                    </div>
                  )}

                  <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Task Title</label>
                      <Input
                        required
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Draft Event Guidelines"
                        className="bg-background/50 border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Description</label>
                      <Textarea
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        placeholder="Provide details about expectations, deliverables, and outputs..."
                        className="bg-background/50 border-white/10 h-16 min-h-[60px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Vertical</label>
                        <Select value={newTaskVertical} onValueChange={setNewTaskVertical}>
                          <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                            <SelectValue placeholder="Select vertical" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0f19] border-white/10">
                            {verticals.map(v => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Event Category</label>
                        <Select value={newTaskEvent} onValueChange={setNewTaskEvent}>
                          <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0f19] border-white/10">
                            {events
                              .filter(e => !newTaskVertical || e.verticalId === newTaskVertical)
                              .map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Assignee</label>
                        <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                          <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0f19] border-white/10">
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {users.map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.name} ({u.role.toLowerCase()})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                        <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                          <SelectTrigger className="bg-[#0b0f19]/80 border-white/10 text-xs">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0b0f19] border-white/10">
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                        <Input
                          type="date"
                          value={newTaskStart}
                          onChange={e => setNewTaskStart(e.target.value)}
                          className="bg-background/50 border-white/10 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">End/Due Date</label>
                        <Input
                          type="date"
                          value={newTaskEnd}
                          onChange={e => setNewTaskEnd(e.target.value)}
                          className="bg-background/50 border-white/10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                      <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submittingTask} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {submittingTask ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create Task
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
                const hasChildren = node.children && node.children.length > 0;
                const isExpanded = expandedIds.has(node.id);
                const isTask = node.type === "task";

                return (
                  <div 
                    key={node.id} 
                    className="h-[44px] flex items-center px-3 hover:bg-white/5 transition-colors group"
                    style={{ paddingLeft: `${node.depth * 14 + 10}px` }}
                  >
                    {!isTask && (
                      <button 
                        onClick={() => toggleExpand(node.id)}
                        className="p-1 hover:bg-white/10 rounded mr-1.5 shrink-0 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    
                    {/* Color dot for visual hierarchy */}
                    {node.type === "vertical" && (
                      <Circle className="w-2.5 h-2.5 mr-2 shrink-0 fill-indigo-400 stroke-indigo-400" />
                    )}
                    {node.type === "event" && (
                      <Circle className="w-2 h-2 mr-2 shrink-0 fill-amber-500 stroke-amber-500" />
                    )}
                    
                    <div className="flex-1 min-w-0 pr-2">
                      {editingNodeId === node.id ? (
                        <input
                          autoFocus
                          value={editingTitleValue}
                          onChange={e => setEditingTitleValue(e.target.value)}
                          onBlur={() => handleSaveTitleInline(node.id)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleSaveTitleInline(node.id);
                            if (e.key === "Escape") setEditingNodeId(null);
                          }}
                          className="bg-[#05070c] text-sm font-medium border border-indigo-500/50 rounded px-1.5 py-0.5 w-full text-foreground focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span 
                            onDoubleClick={() => handleDoubleClickTitle(node)}
                            className={`text-sm truncate select-none ${
                              node.type === "vertical" ? "font-bold text-indigo-100" :
                              node.type === "event" ? "font-semibold text-amber-50" :
                              "font-normal text-muted-foreground group-hover:text-foreground"
                            }`}
                            title={isOrganiserOrAdmin && isTask ? "Double-click to inline edit title" : undefined}
                          >
                            {node.title}
                          </span>
                          
                          {/* Indicator that title is inline editable */}
                          {isOrganiserOrAdmin && isTask && (
                            <Edit2 className="w-3 h-3 text-muted-foreground/0 group-hover:text-indigo-400 transition-colors shrink-0" />
                          )}
                        </div>
                      )}
                    </div>

                    {isTask && node.taskData?.assignedTo && (
                      <Badge variant="outline" className="text-[10px] scale-90 border-white/20 text-muted-foreground shrink-0 max-w-[80px] truncate">
                        {node.taskData.assignedTo.name.split(" ")[0]}
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
                
                {/* ─── Today vertical marker line ─── */}
                {(() => {
                  const todayIndex = timelineDays.findIndex(
                    day => format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  );
                  if (todayIndex === -1) return null;
                  
                  return (
                    <div 
                      className="absolute top-0 bottom-0 border-l-2 border-dashed border-rose-500/70 z-20 pointer-events-none"
                      style={{ left: todayIndex * dayWidth }}
                    >
                      <span className="absolute top-1 left-2 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-bold uppercase tracking-wider">
                        Today
                      </span>
                    </div>
                  );
                })()}

                {/* ─── SVG Dependency Line Connector Layer ─── */}
                <svg 
                  className="absolute inset-0 pointer-events-none z-10 w-full h-full"
                >
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="rgba(129, 140, 248, 0.45)" />
                    </marker>
                  </defs>

                  {flatNodes.map((node, nodeIdx) => {
                    if (node.type !== "task" || !node.taskData?.dependsOnIds) return null;
                    
                    return node.taskData.dependsOnIds.map((predId) => {
                      const predIdx = taskIdToIndexMap.get(predId);
                      if (predIdx === undefined) return null;

                      // Predecessor position calculations
                      const predNode = flatNodes[predIdx];
                      if (!predNode.taskData?.startDate || !predNode.taskData?.endDate) return null;
                      const pStart = parseISO(predNode.taskData.startDate);
                      const pEnd = parseISO(predNode.taskData.endDate);
                      const pLeft = differenceInDays(pStart, timelineStart) * dayWidth;
                      const pWidth = (differenceInDays(pEnd, pStart) + 1) * dayWidth;
                      
                      const x1 = pLeft + pWidth;
                      const y1 = predIdx * rowHeight + rowHeight / 2;

                      // Successor (current node) position calculations
                      if (!node.taskData?.startDate || !node.taskData?.endDate) return null;
                      const sStart = parseISO(node.taskData.startDate);
                      const sEnd = parseISO(node.taskData.endDate);
                      const sLeft = differenceInDays(sStart, timelineStart) * dayWidth;

                      const x2 = sLeft;
                      const y2 = nodeIdx * rowHeight + rowHeight / 2;

                      // Draw cubic bezier curve from right side of predecessor to left side of successor
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
                  const isTask = node.type === "task";
                  const taskStart = isTask && node.taskData?.startDate ? parseISO(node.taskData.startDate) : null;
                  const taskEnd = isTask && node.taskData?.endDate ? parseISO(node.taskData.endDate) : null;

                  // Aligned position calculation
                  let left = 0;
                  let width = 0;

                  if (isTask && taskStart && taskEnd) {
                    let calcStart = taskStart;
                    let calcEnd = taskEnd;

                    // If currently dragging, update render positions dynamically
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
                        node.type === "event" ? "bg-amber-500/5" : ""
                      }`}
                    >
                      {/* Day Grid Lines vertical lines helper background */}
                      <div className="absolute inset-0 flex pointer-events-none z-0">
                        {timelineDays.map((_, i) => (
                          <div key={i} className="h-full border-r border-white/5 shrink-0" style={{ width: dayWidth }} />
                        ))}
                      </div>

                      {/* Timeline Task Bar */}
                      {isTask && width > 0 && node.taskData && (
                        <div 
                          onClick={() => handleOpenDetails(node.taskData!)}
                          className={`absolute h-7 rounded-md border flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.4)] px-2.5 group cursor-pointer transition-all ${
                            getStatusColor(node.taskData.status)
                          }`}
                          style={{ left, width }}
                          onMouseDown={(e) => handleMouseDownBar(e, node.taskData!, "move")}
                          title="Click to view details. Drag to reschedule."
                        >
                          {/* Completion Progress Bar Overlay */}
                          <div 
                            className="absolute top-0 bottom-0 left-0 bg-black/25 pointer-events-none rounded-l-md"
                            style={{ width: `${node.taskData.progressPercent}%` }}
                          />

                          <div className="relative z-10 flex items-center gap-1.5 min-w-0 select-none">
                            <span className="text-[10px] text-white font-bold truncate">
                              {node.title}
                            </span>
                            <span className="text-[9px] text-white/70 font-semibold">
                              ({node.taskData.progressPercent}%)
                            </span>
                          </div>

                          {/* Resize handle (right edge of bar) */}
                          {isOrganiserOrAdmin && (
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</label>
                  <p className="text-sm text-slate-200 mt-1">
                    {selectedTask.startDate ? format(parseISO(selectedTask.startDate), "MMM dd, yyyy") : "TBD"} — {selectedTask.endDate ? format(parseISO(selectedTask.endDate), "MMM dd, yyyy") : "TBD"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {selectedTask.assignedTo?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm text-slate-200 font-medium">
                      {selectedTask.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded bg-white/5 overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${selectedTask.progressPercent}%` }} />
                    </div>
                    <span className="text-xs font-mono">{selectedTask.progressPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between">
                <Button 
                  variant="outline" 
                  className="w-full border-white/10"
                  onClick={() => {
                    setIsTaskDetailsOpen(false);
                    // Navigate to full details page
                    window.location.href = `/organiser/tasks/${selectedTask.id}`;
                  }}
                >
                  Edit Task Details
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
