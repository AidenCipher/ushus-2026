"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, useDragControls } from "framer-motion";
import { addDays, format, differenceInDays, subDays } from "date-fns";
import { Plus, Maximize2, Filter, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// 1 Day = 60px in our timeline grid
const DAY_WIDTH = 60;
const START_DATE = new Date(2025, 11, 1); // Dec 1, 2025

interface Task {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  assignee: string;
}

const initialTasks: Task[] = [
  { id: "t1", title: "Finalize Budget", start: new Date(2025, 11, 5), end: new Date(2025, 11, 15), color: "bg-blue-500", assignee: "Admin" },
  { id: "t2", title: "Vendor Contracts", start: new Date(2025, 11, 12), end: new Date(2025, 11, 25), color: "bg-purple-500", assignee: "Logistics" },
  { id: "t3", title: "Marketing Launch", start: new Date(2025, 11, 20), end: new Date(2026, 0, 10), color: "bg-indigo-500", assignee: "Marketing" },
  { id: "t4", title: "Registration Open", start: new Date(2025, 11, 25), end: new Date(2026, 0, 15), color: "bg-emerald-500", assignee: "IT" },
];

export default function GanttPage() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Generate a timeline of 60 days
  const timelineDays = Array.from({ length: 60 }).map((_, i) => addDays(START_DATE, i));

  const handleDragEnd = (id: string, info: any, isResize: boolean, direction?: 'left' | 'right') => {
    const deltaX = info.offset.x;
    const daysShift = Math.round(deltaX / DAY_WIDTH);
    
    if (daysShift === 0) return;

    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        if (isResize) {
          if (direction === 'right') {
            return { ...task, end: addDays(task.end, daysShift) };
          } else if (direction === 'left') {
            return { ...task, start: addDays(task.start, daysShift) };
          }
        }
        // Reschedule (move both start and end)
        return {
          ...task,
          start: addDays(task.start, daysShift),
          end: addDays(task.end, daysShift)
        };
      }
      return task;
    }));
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Timeline</h1>
          <p className="text-muted-foreground mt-1">Interactive Gantt chart for event planning.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Add Milestone
          </Button>
        </div>
      </div>

      <Card className="glass border-white/10 flex-1 overflow-hidden flex flex-col">
        <CardHeader className="shrink-0 border-b border-white/5 py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Master Schedule</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /> Drag bar to reschedule</span>
              <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> Drag handles to extend</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden relative">
          <div 
            ref={scrollRef}
            className="w-full h-full overflow-auto relative custom-scrollbar bg-background/20"
          >
            {/* Timeline Header */}
            <div 
              className="sticky top-0 z-20 flex bg-background/80 backdrop-blur-md border-b border-white/10"
              style={{ width: timelineDays.length * DAY_WIDTH + 200 }} // 200px for labels
            >
              <div className="w-[200px] shrink-0 border-r border-white/10 p-3 sticky left-0 z-30 bg-background/90 backdrop-blur-md font-semibold text-sm flex items-center">
                Task List
              </div>
              <div className="flex">
                {timelineDays.map((day, i) => (
                  <div 
                    key={i} 
                    className="shrink-0 border-r border-white/5 flex flex-col items-center justify-center p-1"
                    style={{ width: DAY_WIDTH }}
                  >
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">{format(day, 'MMM')}</span>
                    <span className={`text-sm ${day.getDay() === 0 || day.getDay() === 6 ? 'text-indigo-400 font-bold' : ''}`}>
                      {format(day, 'dd')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Body */}
            <div 
              className="relative"
              style={{ width: timelineDays.length * DAY_WIDTH + 200 }}
            >
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex ml-[200px] pointer-events-none z-0">
                {timelineDays.map((_, i) => (
                  <div key={i} className="h-full border-r border-white/5 shrink-0" style={{ width: DAY_WIDTH }} />
                ))}
              </div>

              {/* Tasks */}
              <div className="relative z-10 py-4 space-y-4">
                {tasks.map((task) => {
                  const startOffset = Math.max(0, differenceInDays(task.start, START_DATE));
                  const duration = differenceInDays(task.end, task.start) + 1; // +1 to include end day
                  
                  return (
                    <div key={task.id} className="flex h-12 items-center group relative hover:bg-white/5 transition-colors">
                      {/* Task Label */}
                      <div className="w-[200px] shrink-0 border-r border-white/10 px-3 sticky left-0 z-20 bg-background/50 backdrop-blur-sm h-full flex flex-col justify-center">
                        <span className="text-sm font-medium truncate">{task.title}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{task.assignee}</span>
                      </div>
                      
                      {/* Gantt Bar */}
                      <div className="relative h-full flex items-center">
                        <motion.div
                          drag="x"
                          dragMomentum={false}
                          onDragEnd={(e, info) => handleDragEnd(task.id, info, false)}
                          initial={false}
                          className={`absolute h-8 rounded-md ${task.color} shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-between group/bar`}
                          style={{
                            left: startOffset * DAY_WIDTH,
                            width: duration * DAY_WIDTH,
                          }}
                        >
                          {/* Left Resize Handle */}
                          <motion.div
                            drag="x"
                            dragMomentum={false}
                            onDragEnd={(e, info) => handleDragEnd(task.id, info, true, 'left')}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent triggering parent drag
                            className="w-3 h-full cursor-col-resize hover:bg-black/20 rounded-l-md flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity"
                          >
                            <div className="w-0.5 h-4 bg-white/50 rounded-full" />
                          </motion.div>

                          <span className="text-xs font-semibold text-white px-2 truncate pointer-events-none select-none">
                            {format(task.start, 'MMM d')} - {format(task.end, 'MMM d')}
                          </span>

                          {/* Right Resize Handle */}
                          <motion.div
                            drag="x"
                            dragMomentum={false}
                            onDragEnd={(e, info) => handleDragEnd(task.id, info, true, 'right')}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent triggering parent drag
                            className="w-3 h-full cursor-col-resize hover:bg-black/20 rounded-r-md flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity"
                          >
                            <div className="w-0.5 h-4 bg-white/50 rounded-full" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
