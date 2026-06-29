"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Loader2, Clock, User, Calendar,
  CheckCircle2, XCircle, AlertCircle, MessageSquare,
  GitBranch, Pencil
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

interface TaskUpdate {
  id: string;
  updateType: string;
  previousStatus: string | null;
  newStatus: string | null;
  previousProgress: number | null;
  newProgress: number | null;
  note: string;
  approvalStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedBy: { id: string; name: string };
  approvedBy: { id: string; name: string } | null;
  approvedAt: string | null;
}

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progressPercent: number;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
  assignedTo: { id: string; name: string; email: string; profilePictureUrl: string | null } | null;
  assignedBy: { id: string; name: string } | null;
  vertical: { id: string; name: string } | null;
  event: { id: string; name: string } | null;
  dependsOn: { id: string; title: string; status: string }[];
  dependedOnBy: { id: string; title: string; status: string }[];
  updates: TaskUpdate[];
  createdAt: string;
  updatedAt: string;
}

export default function TaskDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = React.useState<TaskDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Update form state
  const [showUpdateForm, setShowUpdateForm] = React.useState(false);
  const [updateNote, setUpdateNote] = React.useState("");
  const [newStatus, setNewStatus] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  
  // Approval state
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const fetchTask = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`);
      if (res.ok) {
        const json = await res.json();
        setTask(json.data);
      } else {
        setError("Task not found");
      }
    } catch {
      setError("Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  React.useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  async function submitUpdate() {
    if (updateNote.length < 20) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateType: newStatus ? "STATUS_CHANGE" : "NOTE_ADDED",
          newStatus: newStatus || undefined,
          note: updateNote,
        }),
      });
      if (res.ok) {
        setUpdateNote("");
        setNewStatus("");
        setShowUpdateForm(false);
        await fetchTask();
      }
    } catch (err) {
      console.error("Failed to submit update:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApproval(updateId: string, action: "APPROVED" | "REJECTED") {
    try {
      await fetch(`/api/v1/tasks/${taskId}/updates/${updateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: action,
          rejectionReason: action === "REJECTED" ? rejectionReason : undefined,
        }),
      });
      setRejectingId(null);
      setRejectionReason("");
      await fetchTask();
    } catch (err) {
      console.error("Failed to process approval:", err);
    }
  }

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

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  const userRole = session?.user?.role;
  const canApprove = userRole === "ORGANISER" || userRole === "ADMIN";
  const isAssignee = task?.assignedTo?.id === session?.user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-danger" />
        <h2 className="text-xl font-semibold">{error || "Task not found"}</h2>
        <Link href="/organiser/tasks">
          <Button variant="outline" className="border-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/organiser/tasks">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column — Task Details (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </CardDescription>
                  )}
                </div>
              </div>

              {/* Metadata pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className={
                  task.priority === "CRITICAL" ? "border-danger/50 text-danger bg-danger/10" :
                  task.priority === "HIGH" ? "border-amber-500/50 text-amber-500 bg-amber-500/10" :
                  task.priority === "MEDIUM" ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" :
                  "border-white/20 text-muted-foreground"
                }>
                  {task.priority}
                </Badge>
                {task.vertical && (
                  <Badge variant="outline" className="border-white/20">{task.vertical.name}</Badge>
                )}
                {task.event && (
                  <Badge variant="outline" className="border-white/20">{task.event.name}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assignee */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  {task.assignedTo?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{task.assignedTo?.name || "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground">{task.assignedTo?.email || "No assignee"}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {task.startDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Start</p>
                    <p className="text-sm font-medium">{new Date(task.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                )}
                {task.endDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> End</p>
                    <p className="text-sm font-medium">{new Date(task.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                )}
                {task.dueDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Due</p>
                    <p className={`text-sm font-medium ${new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" ? "text-danger" : ""}`}>
                      {new Date(task.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{task.progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
                    style={{ width: `${task.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Dependencies */}
              {(task.dependsOn.length > 0 || task.dependedOnBy.length > 0) && (
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" /> Dependencies
                  </p>
                  {task.dependsOn.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Depends on:</p>
                      {task.dependsOn.map(dep => (
                        <Link key={dep.id} href={`/organiser/tasks/${dep.id}`}>
                          <div className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-sm truncate">{dep.title}</span>
                            <Badge variant="outline" className={`${getStatusColor(dep.status)} text-[10px]`}>{dep.status.replace(/_/g, " ")}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {task.dependedOnBy.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Blocking:</p>
                      {task.dependedOnBy.map(dep => (
                        <Link key={dep.id} href={`/organiser/tasks/${dep.id}`}>
                          <div className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                            <span className="text-sm truncate">{dep.title}</span>
                            <Badge variant="outline" className={`${getStatusColor(dep.status)} text-[10px]`}>{dep.status.replace(/_/g, " ")}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Update Task Button */}
              {(isAssignee || canApprove) && (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setShowUpdateForm(true)}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Update Task
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Submit Update Form */}
          {showUpdateForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-lg">Submit Task Update</CardTitle>
                  <CardDescription>Describe what changed and why. Minimum 20 characters required.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">New Status (optional)</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Keep current status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="DELAYED">Delayed</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Update Note <span className="text-danger">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe what was done, what changed, and any blockers..."
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      className="bg-background/50 border-white/10 min-h-[100px]"
                    />
                    <p className={`text-xs mt-1 ${updateNote.length >= 20 ? "text-success" : "text-muted-foreground"}`}>
                      {updateNote.length}/20 characters minimum
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={updateNote.length < 20 || submitting}
                      onClick={submitUpdate}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Update
                    </Button>
                    <Button variant="outline" className="border-white/10" onClick={() => setShowUpdateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column — Update Thread (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">Activity Thread</h2>
            <Badge variant="outline" className="border-white/20 text-xs">{task.updates.length}</Badge>
          </div>

          {task.updates.length === 0 ? (
            <Card className="glass border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No updates yet. Be the first to add one.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {task.updates.map((update, i) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass border-white/10">
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                            {update.updatedBy.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{update.updatedBy.name}</p>
                            <p className="text-[10px] text-muted-foreground" title={new Date(update.createdAt).toLocaleString()}>
                              {formatRelativeTime(update.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          update.updateType === "STATUS_CHANGE" ? "border-blue-500/50 text-blue-400 bg-blue-500/10" :
                          update.updateType === "PROGRESS_UPDATE" ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" :
                          update.updateType === "REASSIGNED" ? "border-amber-500/50 text-amber-500 bg-amber-500/10" :
                          "border-white/20"
                        }>
                          {update.updateType.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      {/* Status change */}
                      {update.previousStatus && update.newStatus && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className={`${getStatusColor(update.previousStatus)} text-[10px]`}>
                            {update.previousStatus.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className={`${getStatusColor(update.newStatus)} text-[10px]`}>
                            {update.newStatus.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      )}

                      {/* Progress change */}
                      {update.previousProgress !== null && update.newProgress !== null && (
                        <p className="text-xs text-muted-foreground">
                          Progress: {update.previousProgress}% → {update.newProgress}%
                        </p>
                      )}

                      {/* Note */}
                      <div className="bg-white/5 border border-white/5 rounded-md p-3">
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{update.note}</p>
                      </div>

                      {/* Approval Status */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={
                          update.approvalStatus === "APPROVED" ? "border-success/50 text-success bg-success/10" :
                          update.approvalStatus === "REJECTED" ? "border-danger/50 text-danger bg-danger/10" :
                          "border-amber-500/50 text-amber-500 bg-amber-500/10"
                        }>
                          {update.approvalStatus === "APPROVED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {update.approvalStatus === "REJECTED" && <XCircle className="w-3 h-3 mr-1" />}
                          {update.approvalStatus === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                          {update.approvalStatus === "APPROVED" ? "Approved" :
                           update.approvalStatus === "REJECTED" ? "Rejected" : "Pending Review"}
                        </Badge>
                        {update.approvedBy && (
                          <span className="text-[10px] text-muted-foreground">by {update.approvedBy.name}</span>
                        )}
                      </div>

                      {/* Rejection reason */}
                      {update.approvalStatus === "REJECTED" && update.rejectionReason && (
                        <div className="bg-danger/10 border border-danger/20 rounded-md p-2">
                          <p className="text-xs text-danger">{update.rejectionReason}</p>
                        </div>
                      )}

                      {/* Approve / Reject Buttons */}
                      {canApprove && update.approvalStatus === "PENDING" && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          {rejectingId === update.id ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="bg-background/50 border-white/10 text-sm min-h-[60px]"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" variant="destructive" onClick={() => handleApproval(update.id, "REJECTED")} disabled={!rejectionReason}>
                                  Confirm Reject
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setRejectionReason(""); }}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-success hover:bg-success/80" onClick={() => handleApproval(update.id, "APPROVED")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-danger/50 text-danger hover:bg-danger/10" onClick={() => setRejectingId(update.id)}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
