"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, Search, Plus, Filter, Clock, 
  Loader2, ChevronLeft, ChevronRight, ArrowUpDown 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import Link from "next/link";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  progressPercent: number;
  assignedTo: { id: string; name: string; email: string } | null;
  event: { id: string; name: string } | null;
  vertical: { id: string; name: string } | null;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DELAYED", label: "Delayed" },
  { value: "BLOCKED", label: "Blocked" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

export default function TasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tasks, setTasks] = React.useState<TaskData[]>([]);
  const [pagination, setPagination] = React.useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"my" | "all">(
    searchParams.get("view") === "all" ? "all" : "my"
  );

  const fetchTasks = React.useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      params.set("view", viewMode);
      params.set("sortBy", "dueDate");
      params.set("sortOrder", "asc");
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);

      const res = await fetch(`/api/v1/tasks?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
        setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [viewMode, statusFilter, priorityFilter]);

  React.useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  // Filter tasks by search query (client-side)
  const filteredTasks = searchQuery
    ? tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedTo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.event?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  function getStatusColor(status: string): string {
    switch (status) {
      case "IN_PROGRESS": return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case "COMPLETED": return "border-success/50 text-success bg-success/10";
      case "DELAYED": return "border-danger/50 text-danger bg-danger/10";
      case "BLOCKED": return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case "NOT_STARTED": return "border-white/20 text-muted-foreground";
      default: return "border-white/20";
    }
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case "CRITICAL": return "border-danger/50 text-danger bg-danger/10";
      case "HIGH": return "border-amber-500/50 text-amber-500 bg-amber-500/10";
      case "MEDIUM": return "border-indigo-500/50 text-indigo-400 bg-indigo-500/10";
      case "LOW": return "border-white/20 text-muted-foreground";
      default: return "border-white/20";
    }
  }

  function formatDueDate(dateStr: string | null): { text: string; urgent: boolean } {
    if (!dateStr) return { text: "No due date", urgent: false };
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / 3600000;
    if (diffHours < 0) return { text: "Overdue", urgent: true };
    if (diffHours < 48) return { text: diffHours < 24 ? "Due today" : "Due tomorrow", urgent: true };
    return { text: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), urgent: false };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">
            {viewMode === "my" ? "Your assigned tasks" : "All tasks across your scope"} • {pagination.total} total
          </p>
        </div>
        {(session?.user?.role === "ORGANISER" || session?.user?.role === "ADMIN") && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        )}
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "my" ? "default" : "outline"} 
            size="sm"
            className={viewMode === "my" ? "bg-indigo-600" : "border-white/10"}
            onClick={() => setViewMode("my")}
          >
            My Tasks
          </Button>
          <Button 
            variant={viewMode === "all" ? "default" : "outline"} 
            size="sm"
            className={viewMode === "all" ? "bg-indigo-600" : "border-white/10"}
            onClick={() => setViewMode("all")}
          >
            All Tasks
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks, assignees, events..." 
              className="pl-9 bg-background/50 border-white/10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-background/50 border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px] bg-background/50 border-white/10">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingAnimation message="Syncing tasks..." />
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="glass border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search or filters." : "No tasks match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map((task, i) => {
            const due = formatDueDate(task.dueDate);
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/organiser/tasks/${task.id}`}>
                  <Card className="glass border-white/10 hover:border-indigo-500/30 transition-colors group cursor-pointer">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Priority bar */}
                          <div className={`w-1.5 h-12 rounded-full shrink-0 mt-0.5 ${
                            task.priority === "CRITICAL" ? "bg-danger" :
                            task.priority === "HIGH" ? "bg-amber-500" :
                            task.priority === "MEDIUM" ? "bg-indigo-500" : "bg-muted-foreground/30"
                          }`} />
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-semibold truncate ${
                              task.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground"
                            }`}>
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className={`w-3 h-3 ${due.urgent ? "text-danger" : ""}`} />
                                <span className={due.urgent ? "text-danger font-medium" : ""}>{due.text}</span>
                              </span>
                              {task.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span>{task.assignedTo.name}</span>
                                </>
                              )}
                              {task.event && (
                                <>
                                  <span>•</span>
                                  <span>{task.event.name}</span>
                                </>
                              )}
                            </div>
                            {/* Progress bar */}
                            {task.progressPercent > 0 && task.status !== "COMPLETED" && (
                              <div className="mt-2 h-1.5 w-full max-w-[200px] bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-500 rounded-full transition-all" 
                                  style={{ width: `${task.progressPercent}%` }} 
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:ml-auto ml-5 shrink-0">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10"
              disabled={pagination.page <= 1}
              onClick={() => fetchTasks(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTasks(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
