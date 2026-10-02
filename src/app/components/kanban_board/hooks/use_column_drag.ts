import { useState } from 'react';

export function useColumnDrag() {
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  return {
    draggedColumnId,
    setDraggedColumnId,
  };
}
