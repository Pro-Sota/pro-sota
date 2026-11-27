"use client";

import { useCallback, useState } from "react";

export function useTaskDrag() {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const startTaskDrag = useCallback((taskId: string) => {
    setDraggedTaskId(taskId);
  }, []);

  const clearTaskDrag = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }, []);

  return {
    draggedTaskId,
    dragOverColumnId,
    setDragOverColumnId,
    startTaskDrag,
    clearTaskDrag,
  };
}