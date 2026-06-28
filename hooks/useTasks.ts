"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import type { Task } from "@prisma/client";

interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  verticalId?: string;
  eventId?: string;
  view?: "my" | "all";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook for task CRUD operations with loading/error state management
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.priority) params.set("priority", filters.priority);
      if (filters?.assigneeId) params.set("assigneeId", filters.assigneeId);
      if (filters?.verticalId) params.set("verticalId", filters.verticalId);
      if (filters?.eventId) params.set("eventId", filters.eventId);
      if (filters?.view) params.set("view", filters.view);
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.limit) params.set("limit", String(filters.limit));
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);

      const { data } = await axios.get<TasksResponse>(
        `/api/v1/tasks?${params.toString()}`
      );
      setTasks(data.data);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to fetch tasks"
          : "Failed to fetch tasks";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (taskData: Record<string, unknown>): Promise<Task | null> => {
      setError(null);
      try {
        const { data } = await axios.post("/api/v1/tasks", taskData);
        if (data.success) {
          setTasks((prev) => [data.data, ...prev]);
          return data.data;
        }
        return null;
      } catch (err) {
        const message =
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to create task"
            : "Failed to create task";
        setError(message);
        return null;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (
      id: string,
      updates: Record<string, unknown>
    ): Promise<Task | null> => {
      setError(null);
      try {
        const { data } = await axios.patch(`/api/v1/tasks/${id}`, updates);
        if (data.success) {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? data.data : t))
          );
          return data.data;
        }
        return null;
      } catch (err) {
        const message =
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Failed to update task"
            : "Failed to update task";
        setError(message);
        return null;
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      await axios.delete(`/api/v1/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to delete task"
          : "Failed to delete task";
      setError(message);
      return false;
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setTasks,
  };
}
