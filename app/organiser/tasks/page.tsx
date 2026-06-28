"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Search, Plus, Filter, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function TasksPage() {
  const tasks = [
    { id: 1, title: "Finalize Sponsorship Deck", assignee: "Alice", status: "In Progress", priority: "High", due: "Today" },
    { id: 2, title: "Coordinate with AV Team for Main Auditorium", assignee: "Bob", status: "Pending", priority: "Medium", due: "Tomorrow" },
    { id: 3, title: "Draft Event Rulebook", assignee: "Charlie", status: "Review", priority: "High", due: "Jan 10" },
    { id: 4, title: "Send Speaker Invites", assignee: "Alice", status: "Completed", priority: "Low", due: "Last Week" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track progress across your vertical.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-9 bg-background/50 border-white/10" />
        </div>
        <Button variant="outline" className="shrink-0 border-white/10">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task, i) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass border-white/10 hover:border-indigo-500/30 transition-colors group">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    task.status === 'Completed' ? 'bg-success border-success text-white' : 'border-muted-foreground'
                  }`}>
                    {task.status === 'Completed' && <CheckSquare className="w-3 h-3" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {task.due}</span>
                      <span>•</span>
                      <span>Assigned to <span className="font-medium text-foreground">{task.assignee}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto ml-9">
                  <Badge variant="outline" className={
                    task.status === 'In Progress' ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10' :
                    task.status === 'Review' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
                    task.status === 'Completed' ? 'border-success/50 text-success bg-success/10' :
                    'border-white/20'
                  }>
                    {task.status}
                  </Badge>
                  <Badge variant="outline" className={
                    task.priority === 'High' ? 'border-danger/50 text-danger bg-danger/10' :
                    task.priority === 'Medium' ? 'border-amber-500/50 text-amber-500 bg-amber-500/10' :
                    'border-white/20 text-muted-foreground'
                  }>
                    {task.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
