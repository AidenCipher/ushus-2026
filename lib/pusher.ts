import PusherServer from "pusher";
import PusherClient from "pusher-js";
import { isFeatureEnabled } from "@/lib/features.config";

/**
 * Pusher server instance for sending events from API routes
 */
let pusherServerInstance: PusherServer | null = null;

export function getPusherServer(): PusherServer | null {
  if (!isFeatureEnabled("REAL_TIME_NOTIFICATIONS")) return null;

  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.PUSHER_CLUSTER
  ) {
    console.warn("[Pusher] Server not configured — real-time disabled");
    return null;
  }

  if (!pusherServerInstance) {
    pusherServerInstance = new PusherServer({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherServerInstance;
}

/**
 * Create a Pusher client instance for the browser
 */
export function createPusherClient(): PusherClient | null {
  if (!isFeatureEnabled("REAL_TIME_NOTIFICATIONS")) return null;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    console.warn("[Pusher] Client not configured — real-time disabled");
    return null;
  }

  return new PusherClient(key, {
    cluster,
    forceTLS: true,
  });
}

/**
 * Send a real-time notification to a specific user channel
 */
export async function sendPusherNotification(
  userId: string,
  eventName: string,
  data: Record<string, unknown>
): Promise<void> {
  const pusher = getPusherServer();
  if (!pusher) return;

  try {
    await pusher.trigger(`private-user-${userId}`, eventName, data);
  } catch (error) {
    console.error("[Pusher] Failed to send notification:", error);
  }
}

/**
 * Pusher channel names
 */
export const PusherChannels = {
  userNotifications: (userId: string) => `private-user-${userId}`,
  globalAnnouncements: "global-announcements",
} as const;

/**
 * Pusher event names
 */
export const PusherEvents = {
  NEW_NOTIFICATION: "new-notification",
  TASK_UPDATED: "task-updated",
  ANNOUNCEMENT: "announcement",
} as const;
