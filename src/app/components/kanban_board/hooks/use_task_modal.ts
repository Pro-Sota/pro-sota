import { useEffect, useState } from 'react';
import type { Task } from '../types';

export function useTaskModal(tasks: Task[]) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => task.taskId === selectedTaskId) ?? null;

  useEffect(() => {
    if (!selectedTaskId) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedTaskId(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId]);

  return {
    selectedTask,
    selectedTaskId,
    openTask: setSelectedTaskId,
    closeTask: () => setSelectedTaskId(null),
  };
}
