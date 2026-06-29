"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Megaphone, Loader2, MailOpen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useSession } from "next-auth/react";

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedTaskId: string | null;
}

export default function OrganiserNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterMode, setFilterMode] = React.useState<"all" | "unread">("all");
  
  // Broadcast dialog state
  const [broadcastTitle, setBroadcastTitle] = React.useState("");
  const [broadcastBody, setBroadcastBody] = React.useState("");
  const [broadcastTargetRole, setBroadcastTargetRole] = React.useState("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = React.useState(false);

  const userRole = session?.user?.role;
  const canBroadcast = userRole === "ORGANISER" || userRole === "ADMIN";

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/notifications?unreadOnly=${filterMode === "unread"}`);
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  async function toggleReadStatus(id: string, currentRead: boolean) {
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentRead }),
      });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to update notification read status:", err);
    }
  }

  async function deleteNotification(id: string) {
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }

  async function handleSendBroadcast() {
    if (!broadcastTitle || !broadcastBody) return;
    setSubmittingBroadcast(true);
    try {
      const res = await fetch("/api/v1/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
          targetRole: broadcastTargetRole === "all" ? null : broadcastTargetRole,
        }),
      });
      if (res.ok) {
        setBroadcastTitle("");
        setBroadcastBody("");
        setBroadcastTargetRole("all");
        setIsDialogOpen(false);
      }
    } catch (err) {
      console.error("Failed to submit broadcast:", err);
    } finally {
      setSubmittingBroadcast(false);
    }
  }

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Activity alerts, system updates, and task changes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-white/10 text-xs" onClick={markAllAsRead}>
            Mark all as read
          </Button>

          {canBroadcast && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-xs shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                  <Megaphone className="w-4 h-4 mr-2" /> Send Broadcast
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-white/15">
                <DialogHeader>
                  <DialogTitle>Send Fest Broadcast</DialogTitle>
                  <DialogDescription>Create a global announcement visible to participants or organisers.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Title</label>
                    <Input 
                      placeholder="e.g. Schedule Update / Event Room Change" 
                      className="bg-background/50 border-white/10"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Target Audience</label>
                    <Select value={broadcastTargetRole} onValueChange={setBroadcastTargetRole}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Select Audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone (All Roles)</SelectItem>
                        <SelectItem value="PARTICIPANT">Participants Only</SelectItem>
                        <SelectItem value="VOLUNTEER">Volunteers Only</SelectItem>
                        <SelectItem value="ORGANISER">Organisers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Message</label>
                    <Textarea 
                      placeholder="Type broadcast message details here..." 
                      className="bg-background/50 border-white/10 min-h-[100px]"
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" className="border-white/10" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSendBroadcast} disabled={submittingBroadcast || !broadcastTitle || !broadcastBody}>
                      {submittingBroadcast ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Post Broadcast
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter Mode */}
      <div className="flex gap-2">
        <Button 
          variant={filterMode === "all" ? "default" : "outline"} 
          size="sm"
          className={filterMode === "all" ? "bg-indigo-600" : "border-white/10"}
          onClick={() => setFilterMode("all")}
        >
          All Notifications
        </Button>
        <Button 
          variant={filterMode === "unread" ? "default" : "outline"} 
          size="sm"
          className={filterMode === "unread" ? "bg-indigo-600" : "border-white/10"}
          onClick={() => setFilterMode("unread")}
        >
          Unread
        </Button>
      </div>

      <Card className="glass border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold">No notifications</p>
              <p className="text-sm">You are completely up to date.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 sm:p-5 flex gap-4 items-start ${!notif.isRead ? 'bg-indigo-500/5' : 'hover:bg-white/5'} transition-colors group`}
                  >
                    {/* Read indicator */}
                    <button 
                      onClick={() => toggleReadStatus(notif.id, notif.isRead)}
                      className="mt-1.5 focus:outline-none"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'border border-white/30 bg-transparent'}`} />
                    </button>
                    
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-muted-foreground border border-white/10">
                      {notif.type === "UPDATE_APPROVED" ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Bell className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold text-sm truncate ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.body}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => toggleReadStatus(notif.id, notif.isRead)}>
                        <MailOpen className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger/80 hover:text-danger hover:bg-danger/10" onClick={() => deleteNotification(notif.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
