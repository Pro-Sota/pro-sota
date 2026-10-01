"use client";

import type {
  KanbanTask,
  ProjectMember,
} from "../types";

import TaskModalHeader from "./task_modal_header";
import TaskModalDetails from "./task_modal_details";
import TaskModalDates from "./task_modal_dates";
import TaskModalDescription from "./task_modal_description";
import TaskModalMembers from "./task_modal_members";
import TaskModalFooter from "./task_modal_footer";

type Props = {
  selectedTask: KanbanTask | null;
  isProjectTasks: boolean;
  projectMembers: ProjectMember[];

  memberPickerOpen: boolean;
  titleDraft: string;

  onClose: () => void;
  onDelete: () => void;

  onTitleChange: (
    value: string,
  ) => void;

  onTitleCommit: () => void;

  onCompletionChange: (
    value: boolean,
  ) => void;

  onPriorityChange: (
    value: KanbanTask["priority"],
  ) => void;

  onStartDateChange: (
    value: string,
  ) => void;

  onDueDateChange: (
    value: string,
  ) => void;

  onDescriptionChange: (
    value: string,
  ) => void;

  onDescriptionBlur: (
    value: string,
  ) => void;

  onMemberToggle: (
    profileId: string,
  ) => void;

  onMemberPickerToggle: (
    value: boolean,
  ) => void;

  getColumnTitle: (
    columnId: string | null,
  ) => string;
};

export default function TaskModal({
  selectedTask,
  ...props
}: Props) {
  if (!selectedTask) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">

        <TaskModalHeader
          task={selectedTask}
          {...props}
        />

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <TaskModalDetails
            task={selectedTask}
            {...props}
          />

          <TaskModalDates
            task={selectedTask}
            {...props}
          />

          <TaskModalDescription
            task={selectedTask}
            {...props}
          />

          {props.isProjectTasks && (
            <TaskModalMembers
              task={selectedTask}
              projectMembers={
                props.projectMembers
              }
              {...props}
            />
          )}
        </div>

        <TaskModalFooter
          task={selectedTask}
          onClose={props.onClose}
          onDelete={props.onDelete}
        />
      </div>
    </div>
  );
}