import { cookies } from 'next/headers';

import { createClient } from '@/app/lib/supabase/server';

import type {
  KanbanBoardData,
  KanbanColumn,
  Task,
  TaskScope,
} from '@/app/components/kanban_board/types';

const DEFAULT_GENERAL_COLUMNS = [
  {
    name: 'To do',
    position: 0,
    is_completed: false,
  },
  {
    name: 'Doing',
    position: 1,
    is_completed: false,
  },
  {
    name: 'Done',
    position: 2,
    is_completed: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Task mapper                                                                */
/* -------------------------------------------------------------------------- */

function mapTask(row: any): Task {
  const members = Array.isArray(row.task_members)
    ? row.task_members
    : [];

  return {
  taskId: row.task_id,
  projectId: row.project_id,
  columnId: row.column_id,

  title: row.title,
  description: row.description,

  priority: row.priority,

  startDate: row.start_date,
  dueDate: row.due_date,

  estimatedHours: row.estimated_hours,
  actualHours: row.actual_hours,

  position: row.position,

  createdAt: row.created_at,
  updatedAt: row.updated_at,

  completed: row.completed,

  members: members.map((member: any) => {
    const profile = Array.isArray(member.profiles)
      ? member.profiles[0]
      : member.profiles;

    return {
      profileId: member.profile_id,
      firstName: profile?.first_name ?? '',
      lastName: profile?.last_name ?? '',
      picture: profile?.profile_picture ?? null,
    };
  }),
  createdBy: ""
};
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export async function getTaskBoard(
  scope: TaskScope,
): Promise<KanbanBoardData> {
  const supabase = await createClient(await cookies());

  /* ---------------------------------------------------------------------- */
  /* Auth user                                                              */
  /* ---------------------------------------------------------------------- */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  /* ---------------------------------------------------------------------- */
  /* User profile                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("profile_id")
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    console.error(
      "Failed to find user profile:",
      profileError,
    );

    throw new Error(
      "Perfil do utilizador não encontrado.",
    );
  }

  const profileId = profile.profile_id;

  /* ---------------------------------------------------------------------- */
  /* Columns                                                                */
  /* ---------------------------------------------------------------------- */

  let columnsQuery = supabase
    .from("task_columns")
    .select(`
      column_id,
      project_id,
      profile_id,
      name,
      position,
      is_completed,
      created_at,
      updated_at
    `)
    .order("position", { ascending: true });

  if (scope.type === "general") {
    /*
     * General columns are PERSONAL.
     *
     * Only return columns belonging to the current profile.
     */
    columnsQuery = columnsQuery
      .is("project_id", null)
      .eq("profile_id", profileId);
  } else {
    /*
     * Project columns are SHARED.
     *
     * Project membership should be validated before reaching this point.
     */
    columnsQuery = columnsQuery.eq(
      "project_id",
      scope.projectId,
    );
  }

  let {
    data: columns,
    error: columnsError,
  } = await columnsQuery;

  if (columnsError) {
    console.error(
      "Failed to fetch task columns:",
      columnsError,
    );

    throw new Error(columnsError.message);
  }

  /* ---------------------------------------------------------------------- */
  /* Default general columns                                                */
  /* ---------------------------------------------------------------------- */

  if (
    scope.type === "general" &&
    (!columns || columns.length === 0)
  ) {
    const {
      data: createdColumns,
      error: createColumnsError,
    } = await supabase
      .from("task_columns")
      .insert(
        DEFAULT_GENERAL_COLUMNS.map((column) => ({
          project_id: null,
          profile_id: profileId,
          name: column.name,
          position: column.position,
          is_completed: column.is_completed,
        })),
      )
      .select(`
        column_id,
        project_id,
        profile_id,
        name,
        position,
        is_completed,
        created_at,
        updated_at
      `)
      .order("position", { ascending: true });

    if (createColumnsError) {
      /*
       * Another request may have created the columns at the
       * same time. Fetch only this user's general columns.
       */
      const {
        data: existingColumns,
        error: retryError,
      } = await supabase
        .from("task_columns")
        .select(`
          column_id,
          project_id,
          profile_id,
          name,
          position,
          is_completed,
          created_at,
          updated_at
        `)
        .is("project_id", null)
        .eq("profile_id", profileId)
        .order("position", { ascending: true });

      if (retryError) {
        throw new Error(retryError.message);
      }

      columns = existingColumns ?? [];
    } else {
      columns = createdColumns ?? [];
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Tasks                                                                  */
  /* ---------------------------------------------------------------------- */

  let tasksQuery = supabase
    .from("tasks")
    .select(`
      task_id,
      project_id,
      column_id,
      title,
      description,
      priority,
      start_date,
      due_date,
      estimated_hours,
      actual_hours,
      position,
      created_at,
      updated_at,
      completed,
      task_members!inner (
        task_member_id,
        task_id,
        profile_id,
        profiles (
          profile_id,
          first_name,
          last_name,
          profile_picture
        )
      )
    `)
    .eq(
      "task_members.profile_id",
      profileId,
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  /* ---------------------------------------------------------------------- */
  /* Scope                                                                  */
  /* ---------------------------------------------------------------------- */

  if (scope.type === "general") {
    /*
     * General tasks are personal/assigned tasks.
     */
    tasksQuery = tasksQuery.is(
      "project_id",
      null,
    );
  } else {
    /*
     * Project tasks are shared within the project.
     */
    tasksQuery = tasksQuery.eq(
      "project_id",
      scope.projectId,
    );
  }

  const {
    data: taskRows,
    error: tasksError,
  } = await tasksQuery;

  if (tasksError) {
    console.error(
      "Failed to fetch tasks:",
      tasksError,
    );

    throw new Error(tasksError.message);
  }

  /* ---------------------------------------------------------------------- */
  /* Normalize tasks                                                        */
  /* ---------------------------------------------------------------------- */

  const normalizedTasks: Task[] = (
    taskRows ?? []
  ).map(mapTask);

  /* ---------------------------------------------------------------------- */
  /* Normalize columns                                                      */
  /* ---------------------------------------------------------------------- */

  const normalizedColumns: KanbanColumn[] = (
    columns ?? []
  ).map((column) => ({
    columnId: column.column_id,
    projectId: column.project_id,
    name: column.name,
    position: column.position,
    isCompleted: column.is_completed,
    createdAt: column.created_at,
    updatedAt: column.updated_at,
  }));

  /* ---------------------------------------------------------------------- */
  /* Debug                                                                  */
  /* ---------------------------------------------------------------------- */

  console.log(
    "[getTaskBoard]",
    {
      userId: user.id,
      profileId,
      scope,
      columns: normalizedColumns.length,
      tasks: normalizedTasks.length,
      taskIds: normalizedTasks.map(
        (task) => task.taskId,
      ),
    },
  );

  return {
    scope,
    columns: normalizedColumns,
    tasks: normalizedTasks,
  };
}