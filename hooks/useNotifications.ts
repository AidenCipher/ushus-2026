"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPusherClient } from "@/lib/pusher";
import { PusherEvents } from "@/lib/pusher";
import axios from "axios";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  relatedTaskId: string | null;
  relatedEventId: string | null;
  createdAt: string;
}

/**
 * Hook for real-time notification subscription via Pusher
 * with fallback polling when Pusher is not configured.
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pusherRef = useRef<ReturnType<typeof createPusherClient>>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/v1/notifications?limit=10");
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(
          data.data.filter((n: NotificationData) => !n.isRead).length
        );
      }
    } catch {
      console.error("[Notifications] Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Subscribe to Pusher channel
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const client = createPusherClient();
    if (client) {
      pusherRef.current = client;
      const channel = client.subscribe(`private-user-${userId}`);

      channel.bind(
        PusherEvents.NEW_NOTIFICATION,
        (data: NotificationData) => {
          setNotifications((prev) => [data, ...prev].slice(0, 50));
          setUnreadCount((prev) => prev + 1);
        }
      );

      return () => {
        channel.unbind_all();
        client.unsubscribe(`private-user-${userId}`);
        client.disconnect();
      };
    }

    // Fallback: poll every 30 seconds if Pusher is not available
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.patch(`/api/v1/notifications/${notificationId}`, {
        isRead: true,
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      console.error("[Notifications] Failed to mark as read");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch("/api/v1/notifications", { markAllRead: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      console.error("[Notifications] Failed to mark all as read");
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
