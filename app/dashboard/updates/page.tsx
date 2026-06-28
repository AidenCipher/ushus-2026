"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Trophy, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UpdatesPage() {
  const updates = [
    {
      id: 1,
      title: "Round 1 details for Best Manager published",
      body: "The case study for Round 1 is now available in your Event Hub. Submissions are due by 5:00 PM today.",
      time: "5 hours ago",
      type: "Event",
      icon: Trophy,
      urgent: true,
    },
    {
      id: 2,
      title: "Welcome to USHUS 2026!",
      body: "Please collect your ID cards from the registration desk at the main entrance. Keep your QR code ready.",
      time: "1 day ago",
      type: "General",
      icon: Bell,
      urgent: false,
    },
    {
      id: 3,
      title: "Valedictory Ceremony Venue Change",
      body: "The closing ceremony will now be held at the Main Auditorium instead of the Open Air Theatre due to weather conditions.",
      time: "2 days ago",
      type: "Alert",
      icon: AlertCircle,
      urgent: false,
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Updates</h1>
        <p className="text-muted-foreground mt-1">Latest announcements and notifications.</p>
      </div>

      <div className="space-y-4">
        {updates.map((update, i) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`glass border-white/10 ${update.urgent ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${update.urgent ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                    <update.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-semibold text-lg">{update.title}</h3>
                      <div className="flex items-center gap-2">
                        {update.urgent && <Badge variant="default" className="bg-primary/20 text-primary border-none">Urgent</Badge>}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{update.time}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{update.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
