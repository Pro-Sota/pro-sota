"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "../types";

export function useTaskModal(tasks: Task[]) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask =
    tasks.find((task) => task.taskId === selectedTaskId) ?? null;

  const openTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const closeTask = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  useEffect(() => {
    if (!selectedTaskId) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeTask();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTaskId, closeTask]);

  return {
    selectedTask,
    selectedTaskId,
    openTask,
    closeTask,
  };
}