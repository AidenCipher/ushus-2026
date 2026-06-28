"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Megaphone } from "lucide-react";

export default function OrganiserNotificationsPage() {
  const notifications = [
    { title: "Sponsorship Deck Approved", body: "The admin team has approved your latest sponsorship deck.", time: "1 hour ago", read: false },
    { title: "New Participant Registration", body: "Team Alpha registered for Best Manager.", time: "3 hours ago", read: true },
    { title: "System Broadcast", body: "Reminder: Weekly all-hands meeting at 6 PM.", time: "Yesterday", read: true },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Activity alerts and broadcasts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10">Mark all as read</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Megaphone className="w-4 h-4 mr-2" /> Send Broadcast
          </Button>
        </div>
      </div>

      <Card className="glass border-white/10">
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {notifications.map((notif, i) => (
              <div key={i} className={`p-4 sm:p-6 flex gap-4 ${!notif.read ? 'bg-indigo-500/5' : 'hover:bg-white/5'} transition-colors`}>
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!notif.read ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-transparent'}`} />
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-muted-foreground border border-white/10">
                  {notif.title.includes("Approved") ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-medium ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.body}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
