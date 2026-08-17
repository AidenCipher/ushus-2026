"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface AnnouncementData {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  createdBy?: { name: string } | null;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = React.useState<AnnouncementData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/v1/announcements?limit=50");
        if (!res.ok) throw new Error("Failed to load updates");
        const json = await res.json();
        if (!cancelled) setUpdates(json.data || []);
      } catch {
        if (!cancelled) setError("Couldn't load updates. Please refresh the page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Updates</h1>
        <p className="text-muted-foreground mt-1">Latest announcements and notifications.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading updates...</p>
        </div>
      ) : error ? (
        <Card className="glass border-danger/30 bg-danger/5">
          <CardContent className="p-6 text-sm text-danger">{error}</CardContent>
        </Card>
      ) : updates.length === 0 ? (
        <Card className="glass border-white/10">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No announcements yet. Check back later!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className="glass border-white/10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-muted-foreground">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(update.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{update.body}</p>
                    {update.createdBy?.name && (
                      <p className="text-[11px] text-muted-foreground/70">— {update.createdBy.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
