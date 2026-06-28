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
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OrganiserOverview() {
  const { data: session } = useSession();

  // Mock data representing backend stats
  const stats = [
    { name: "Total Registrations", value: "842", icon: Users, trend: "+12% this week" },
    { name: "Tasks Completed", value: "45/120", icon: CheckCircle2, trend: "38% completion" },
    { name: "Pending Approvals", value: "12", icon: Clock, trend: "Requires attention" },
  ];

  const upcomingDeadlines = [
    { title: "Finalize Vendor Contracts", due: "Today, 5:00 PM", status: "Critical" },
    { title: "Review Marketing Collaterals", due: "Tomorrow, 10:00 AM", status: "Warning" },
    { title: "Send Speaker Invites", due: "Jan 10, 2026", status: "Normal" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HQ Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name}. Here's the current status of USHUS 2026.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/organiser/tasks">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Manage Tasks
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
                <stat.icon className="h-4 w-4 text-indigo-400" />
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
        {/* Active Workspace */}
        <Card className="glass border-white/10 lg:col-span-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest actions across your vertical</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
             <div className="space-y-4">
               {[
                 { action: "Task Approved", detail: "Sponsorship Deck V2", user: "Alice M.", time: "10 mins ago" },
                 { action: "New Registration", detail: "Team Apex - Best Manager", user: "System", time: "25 mins ago" },
                 { action: "Task Created", detail: "Coordinate with AV Team", user: "You", time: "1 hour ago" },
               ].map((act, i) => (
                 <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                   <div>
                     <p className="text-sm font-medium">{act.action}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">{act.detail} • by {act.user}</p>
                   </div>
                   <span className="text-xs text-muted-foreground whitespace-nowrap">{act.time}</span>
                 </div>
               ))}
             </div>
             <Link href="/organiser/notifications" className="block text-center mt-4">
                <Button variant="ghost" className="w-full text-indigo-400 hover:text-indigo-300">
                  View Activity Log
                </Button>
             </Link>
          </CardContent>
        </Card>

        {/* Deadlines */}
        <Card className="glass border-white/10 lg:col-span-3">
          <CardHeader>
            <CardTitle>Approaching Deadlines</CardTitle>
            <CardDescription>Tasks requiring immediate action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((item, i) => (
                <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                  <div className="absolute left-1.5 top-5 bottom-0 w-px bg-white/10 last:hidden" />
                  <div className={`w-3 h-3 rounded-full border-2 border-background z-10 mt-1 shrink-0 ${
                    item.status === 'Critical' ? 'bg-danger' : 
                    item.status === 'Warning' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">{item.title}</p>
                    <p className={`text-xs mt-1 ${item.status === 'Critical' ? 'text-danger font-medium' : 'text-muted-foreground'}`}>
                      Due: {item.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}
