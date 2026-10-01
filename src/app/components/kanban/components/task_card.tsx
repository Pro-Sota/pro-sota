"use client";

import type { KanbanTask } from "../types";

import TaskCardHeader from "./task_card_header";
import TaskCardPriority from "./task_card_priority";
import TaskCardMeta from "./task_card_meta";
import TaskCardMembers from "./task_card_members";

type Props = {
  task: KanbanTask;
  onSelect: () => void;
  onDelete: () => void;

  draggable?: boolean;
  onDragStart?: (
    event: React.DragEvent,
  ) => void;
  onDragOver?: (
    event: React.DragEvent,
  ) => void;
  onDrop?: (
    event: React.DragEvent,
  ) => void;
};

export default function TaskCard({
  task,
  onSelect,
  onDelete,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >
      <TaskCardHeader
        task={task}
        onDelete={onDelete}
      />

      <TaskCardPriority
        priority={task.priority}
      />

      <TaskCardMeta task={task} />

      <TaskCardMembers
        members={
          task.assignedMembers ?? []
        }
      />
    </article>
  );
}