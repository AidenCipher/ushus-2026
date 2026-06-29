"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Loader2,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import * as React from "react";
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

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender: { name: string } | null;
}

export default function OrganiserOverview() {
  const { data: session } = useSession();
  const [tasks, setTasks] = React.useState<TaskData[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, notifsRes] = await Promise.all([
          fetch("/api/v1/tasks?limit=50"),
          fetch("/api/v1/notifications?limit=10"),
        ]);

        if (tasksRes.ok) {
          const tasksJson = await tasksRes.json();
          setTasks(tasksJson.data || []);
        }

        if (notifsRes.ok) {
          const notifsJson = await notifsRes.json();
          setNotifications(notifsJson.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute real stats from task data
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const myTasks = tasks.filter(t => t.assignedTo?.id === session?.user?.id);
  const openTasks = myTasks.filter(t => t.status !== "COMPLETED");
  const completedToday = myTasks.filter(
    t => t.status === "COMPLETED" && new Date(t.updatedAt) >= startOfToday
  );
  const overdueTasks = myTasks.filter(
    t => t.dueDate && new Date(t.dueDate) < now && t.status !== "COMPLETED"
  );
  const dueThisWeek = myTasks.filter(
    t => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= endOfWeek && t.status !== "COMPLETED"
  );

  // Upcoming deadlines (next 7 days, all tasks not just mine)
  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= endOfWeek && t.status !== "COMPLETED")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const stats = [
    { name: "Open Tasks", value: String(openTasks.length), icon: AlertCircle, color: "text-indigo-400", trend: `${myTasks.length} total assigned` },
    { name: "Completed Today", value: String(completedToday.length), icon: CheckCircle2, color: "text-success", trend: `${Math.round((myTasks.filter(t => t.status === "COMPLETED").length / Math.max(myTasks.length, 1)) * 100)}% overall` },
    { name: "Overdue", value: String(overdueTasks.length), icon: Clock, color: overdueTasks.length > 0 ? "text-danger" : "text-success", trend: overdueTasks.length > 0 ? "Requires attention" : "All on track" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation message="Syncing workspace details..." />
      </div>
    );
  }

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function formatDueDate(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 0) return "Overdue";
    if (diffHours < 24) return "Today";
    if (diffHours < 48) return "Tomorrow";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HQ Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name}. Here&apos;s the current status of USHUS 2026.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/organiser/tasks">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pt-4">
        {/* Recent Activity */}
        <Card className="glass border-white/10 lg:col-span-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest notifications across your scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No recent activity to show.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex items-start justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.body}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/organiser/notifications" className="block text-center mt-4">
               <Button variant="ghost" className="w-full text-indigo-400 hover:text-indigo-300">
                 View All Notifications
               </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="glass border-white/10 lg:col-span-3">
          <CardHeader>
            <CardTitle>Approaching Deadlines</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No upcoming deadlines this week.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => {
                  const dueStr = formatDueDate(task.dueDate!);
                  const isUrgent = dueStr === "Today" || dueStr === "Overdue";
                  return (
                    <div key={task.id} className="flex gap-3 relative pb-4 last:pb-0">
                      <div className="absolute left-1.5 top-5 bottom-0 w-px bg-white/10 last:hidden" />
                      <div className={`w-3 h-3 rounded-full border-2 border-background z-10 mt-1 shrink-0 ${
                        isUrgent ? 'bg-danger' : 'bg-indigo-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-relaxed truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${isUrgent ? 'text-danger font-medium' : 'text-muted-foreground'}`}>
                            Due: {dueStr}
                          </span>
                          {task.event && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/20">
                              {task.event.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6">
              <Link href="/organiser/tasks">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                  View All Tasks <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due This Week — Quick Table */}
      {dueThisWeek.length > 0 && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              My Tasks Due This Week ({dueThisWeek.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueThisWeek.map((task) => (
                <Link key={task.id} href={`/organiser/tasks/${task.id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-8 rounded-full shrink-0 ${
                        task.priority === "CRITICAL" ? "bg-danger" :
                        task.priority === "HIGH" ? "bg-amber-500" :
                        task.priority === "MEDIUM" ? "bg-indigo-500" : "bg-muted-foreground"
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.event?.name || task.vertical?.name || "General"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge variant="outline" className={
                        task.status === "IN_PROGRESS" ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" :
                        task.status === "BLOCKED" ? "border-amber-500/50 text-amber-500 bg-amber-500/10" :
                        task.status === "DELAYED" ? "border-danger/50 text-danger bg-danger/10" :
                        "border-white/20"
                      }>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDueDate(task.dueDate!)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
