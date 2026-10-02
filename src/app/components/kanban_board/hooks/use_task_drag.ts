import { useState } from 'react';

export function useTaskDrag() {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  function startTaskDrag(taskId: string) {
    setDraggedTaskId(taskId);
  }

  function clearTaskDrag() {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  return {
    draggedTaskId,
    dragOverColumnId,
    setDragOverColumnId,
    startTaskDrag,
    clearTaskDrag,
  };
}
