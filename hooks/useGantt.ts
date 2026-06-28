"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";

export type GanttZoom = "day" | "week" | "month";
export type GanttView = "all" | "myVertical" | "myEvent" | "myTasks";

export interface GanttNode {
  id: string;
  type: "vertical" | "event" | "task";
  title: string;
  colorCode?: string;
  depth: number;
  isExpanded: boolean;
  parentId: string | null;
  children: GanttNode[];
  // Task-specific data
  taskData?: {
    assignedTo: { id: string; name: string } | null;
    status: string;
    priority: string;
    startDate: string | null;
    endDate: string | null;
    dueDate: string | null;
    progressPercent: number;
    dependsOnIds: string[];
  };
}

interface GanttFilters {
  assigneeId?: string;
  status?: string[];
  priority?: string[];
  verticalId?: string;
  view?: GanttView;
}

/**
 * Hook for Gantt chart data management, drag state, and tree operations
 */
export function useGantt() {
  const [nodes, setNodes] = useState<GanttNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<GanttZoom>("week");
  const [filters, setFilters] = useState<GanttFilters>({});
  const [isDragging, setIsDragging] = useState(false);
  const dragDataRef = useRef<{
    taskId: string;
    mode: "move" | "resize";
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);

  // Fetch gantt data
  const fetchGanttData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
      if (filters.status?.length)
        params.set("status", filters.status.join(","));
      if (filters.priority?.length)
        params.set("priority", filters.priority.join(","));
      if (filters.verticalId) params.set("verticalId", filters.verticalId);
      if (filters.view) params.set("view", filters.view);

      const { data } = await axios.get(`/api/v1/gantt?${params.toString()}`);
      if (data.success) {
        setNodes(data.data);
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to fetch Gantt data"
          : "Failed to fetch Gantt data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Toggle node expansion
  const toggleNode = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const toggle = (nodes: GanttNode[]): GanttNode[] =>
        nodes.map((n) => {
          if (n.id === nodeId) {
            return { ...n, isExpanded: !n.isExpanded };
          }
          return { ...n, children: toggle(n.children) };
        });
      return toggle(prev);
    });
  }, []);

  // Expand all nodes
  const expandAll = useCallback(() => {
    setNodes((prev) => {
      const expand = (nodes: GanttNode[]): GanttNode[] =>
        nodes.map((n) => ({
          ...n,
          isExpanded: true,
          children: expand(n.children),
        }));
      return expand(prev);
    });
  }, []);

  // Collapse all nodes
  const collapseAll = useCallback(() => {
    setNodes((prev) => {
      const collapse = (nodes: GanttNode[]): GanttNode[] =>
        nodes.map((n) => ({
          ...n,
          isExpanded: false,
          children: collapse(n.children),
        }));
      return collapse(prev);
    });
  }, []);

  // Flatten visible nodes for rendering
  const flatNodes = useMemo(() => {
    const flat: GanttNode[] = [];
    const flatten = (nodes: GanttNode[]) => {
      for (const node of nodes) {
        flat.push(node);
        if (node.isExpanded && node.children.length > 0) {
          flatten(node.children);
        }
      }
    };
    flatten(nodes);
    return flat;
  }, [nodes]);

  // Drag handlers
  const startDrag = useCallback(
    (
      taskId: string,
      mode: "move" | "resize",
      startX: number,
      originalStart: Date,
      originalEnd: Date
    ) => {
      setIsDragging(true);
      dragDataRef.current = {
        taskId,
        mode,
        startX,
        originalStart,
        originalEnd,
      };
    },
    []
  );

  const endDrag = useCallback(async () => {
    setIsDragging(false);
    dragDataRef.current = null;
  }, []);

  // Update task dates after drag
  const updateTaskDates = useCallback(
    async (taskId: string, startDate: Date, endDate: Date) => {
      try {
        await axios.patch(`/api/v1/tasks/${taskId}`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        await fetchGanttData();
      } catch (err) {
        const message =
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to update task dates"
            : "Failed to update task dates";
        setError(message);
      }
    },
    [fetchGanttData]
  );

  return {
    nodes,
    flatNodes,
    isLoading,
    error,
    zoom,
    filters,
    isDragging,
    dragDataRef,
    setZoom,
    setFilters,
    fetchGanttData,
    toggleNode,
    expandAll,
    collapseAll,
    startDrag,
    endDrag,
    updateTaskDates,
  };
}
