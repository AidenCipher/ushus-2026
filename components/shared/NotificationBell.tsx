"use client";

import * as React from "react";
import { Bell, MailOpen, AlertCircle, Loader2 } from "lucide-react";
import { createPusherClient, PusherEvents } from "@/lib/pusher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  const loadNotifications = React.useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/notifications?limit=5");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe to real-time updates via Pusher
  React.useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = createPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${session.user.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind(PusherEvents.NEW_NOTIFICATION, (data: any) => {
      // Prepend new notification to state
      setNotifications(prev => [
        {
          id: data.id || Math.random().toString(),
          title: data.title || "Notification",
          body: data.body || "",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev
      ]);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [session?.user?.id]);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-all relative focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 bg-indigo-500 border border-background rounded-full text-[10px] text-white">
            {unreadCount}
          </Badge>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 rounded-lg border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <span className="font-semibold text-sm">Recent Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] text-indigo-400 font-medium">{unreadCount} unread</span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto opacity-30 text-indigo-400" />
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 text-left transition-colors flex gap-3 justify-between items-start ${!notif.isRead ? 'bg-indigo-500/5' : 'hover:bg-white/5'}`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className={`text-xs font-semibold truncate ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {notif.body}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                        title="Mark as read"
                      >
                        <MailOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-white/10 bg-white/[0.01] text-center">
              <Link href="/organiser/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-xs text-indigo-400 hover:text-indigo-300 py-1.5 h-auto">
                  View All Alerts
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
