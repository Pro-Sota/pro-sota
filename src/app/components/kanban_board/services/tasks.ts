import { cookies } from 'next/headers';

import { createClient } from '@/app/lib/supabase/server';

import type {
  CreateTaskInput,
  KanbanBoardData,
  Task,
  TaskScope,
  UpdateTaskInput,
} from '../types';

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const VALID_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

export type TaskPriority =
  (typeof VALID_PRIORITIES)[number];

const PRIORITY_MAP: Record<
  string,
  TaskPriority
> = {
  low: 'Low',
  baixa: 'Low',

  medium: 'Medium',
  media: 'Medium',
  média: 'Medium',

  high: 'High',
  alta: 'High',

  critical: 'Critical',
  critica: 'Critical',
  crítica: 'Critical',
};

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TaskMemberRow = {
  profile_id: string;

  profiles:
    | {
        profile_id: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture: string | null;
      }
    | {
        profile_id: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture: string | null;
      }[]
    | null;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isValidPriority(
  value: unknown,
): value is TaskPriority {
  return (
    typeof value === 'string' &&
    VALID_PRIORITIES.includes(
      value as TaskPriority,
    )
  );
}

function normalizePriority(
  value: unknown,
): TaskPriority {
  if (isValidPriority(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return 'Medium';
  }

  const normalized = value
    .trim()
    .toLowerCase();

  if (!normalized) {
    return 'Medium';
  }

  return (
    PRIORITY_MAP[normalized] ??
    'Medium'
  );
}

function normalizeNullableString(
  value: unknown,
): string | null {
  if (
    typeof value !== 'string' ||
    value.trim() === ''
  ) {
    return null;
  }

  return value.trim();
}

/* -------------------------------------------------------------------------- */
/* Task mapper                                                                */
/* -------------------------------------------------------------------------- */

function mapTask(
  row: any,
): Task {
  const members: TaskMemberRow[] =
    Array.isArray(row.task_members)
      ? row.task_members
      : [];

  return {
    taskId: row.task_id,

    projectId:
      row.project_id ?? null,

    columnId:
      row.column_id ?? null,

    title: row.title,

    description:
      row.description ?? null,

    /*
     * The database stores:
     *
     * Low
     * Medium
     * High
     * Critical
     *
     * Your UI type may use lowercase values.
     * Convert only at the boundary if necessary.
     */
    priority:
      normalizePriority(
        row.priority,
      ).toLowerCase() as Task['priority'],

    startDate:
      row.start_date ?? null,

    dueDate:
      row.due_date ?? null,

    estimatedHours:
      row.estimated_hours ?? null,

    actualHours:
      row.actual_hours ?? null,

    position:
      row.position ?? 0,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    completed:
      Boolean(row.completed),

    members:
      members.map(
        (item) => {
          const profile =
            Array.isArray(
              item.profiles,
            )
              ? item.profiles[0]
              : item.profiles;

          return {
            profileId:
              item.profile_id,

            firstName:
              profile?.first_name ??
              '',

            lastName:
              profile?.last_name ??
              '',

            picture:
              profile?.profile_picture ??
              null,
          };
        },
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Supabase                                                                    */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore =
    await cookies();

  return createClient(
    cookieStore,
  );
}

/* -------------------------------------------------------------------------- */
/* Shared task select                                                         */
/* -------------------------------------------------------------------------- */

const TASK_SELECT = `
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
  task_members (
    profile_id,
    profiles (
      profile_id,
      first_name,
      last_name,
      profile_picture
    )
  )
`;

/* -------------------------------------------------------------------------- */
/* Current profile                                                            */
/* -------------------------------------------------------------------------- */

async function getCurrentProfileId(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
): Promise<string> {
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      'Utilizador não autenticado.',
    );
  }

  /*
   * Current schema assumption:
   *
   * profiles.profile_id === auth.users.id
   *
   * If your profiles table has a separate
   * user_id column, change this to:
   *
   * .eq('user_id', user.id)
   */
  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from('profiles')
      .select(
        'profile_id',
      )
      .eq(
        'profile_id',
        user.id,
      )
      .single();

  if (
    profileError ||
    !profile
  ) {
    console.error(
      'Failed to find user profile:',
      profileError,
    );

    throw new Error(
      'Perfil do utilizador não encontrado.',
    );
  }

  return profile.profile_id;
}

/* -------------------------------------------------------------------------- */
/* Get tasks                                                                  */
/* -------------------------------------------------------------------------- */

export async function getTasks(
  scope: TaskScope,
): Promise<Task[]> {
  const supabase =
    await getSupabase();

  const currentProfileId =
    await getCurrentProfileId(
      supabase,
    );

  /*
   * task_members is the source of truth.
   *
   * !inner guarantees that only tasks
   * belonging to the current user are
   * returned.
   */
  let query = supabase
    .from('tasks')
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
      'task_members.profile_id',
      currentProfileId,
    )
    .order('position', {
      ascending: true,
    })
    .order('created_at', {
      ascending: false,
    });

  if (
    scope.type ===
    'general'
  ) {
    query =
      query.is(
        'project_id',
        null,
      );
  } else {
    query =
      query.eq(
        'project_id',
        scope.projectId,
      );
  }

  const {
    data,
    error,
  } =
    await query;

  if (error) {
    console.error(
      'Failed to load tasks:',
      error,
    );

    throw new Error(
      `Failed to load tasks: ${error.message}`,
    );
  }

  return (
    data ?? []
  ).map(
    mapTask,
  );
}

/* -------------------------------------------------------------------------- */
/* Get single task                                                            */
/* -------------------------------------------------------------------------- */

export async function getTask(
  taskId: string,
): Promise<Task> {
  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } =
    await supabase
      .from('tasks')
      .select(
        TASK_SELECT,
      )
      .eq(
        'task_id',
        taskId,
      )
      .single();

  if (error) {
    throw new Error(
      `Failed to load task: ${error.message}`,
    );
  }

  return mapTask(data);
}

/* -------------------------------------------------------------------------- */
/* Create task                                                                */
/* -------------------------------------------------------------------------- */

export async function createTask(
  scope: TaskScope,
  input: CreateTaskInput,
): Promise<Task> {
  const supabase =
    await getSupabase();

  /*
   * Get the authenticated user's
   * profile before creating anything.
   *
   * This is important because the newly
   * created task must be inserted into
   * task_members.
   */
  const currentProfileId =
    await getCurrentProfileId(
      supabase,
    );

  const projectId =
    scope.type === 'general'
      ? null
      : scope.projectId;

  const priority =
    normalizePriority(
      input.priority,
    );

  /* ---------------------------------------------------------------------- */
  /* Validate title                                                         */
  /* ---------------------------------------------------------------------- */

  const title =
    input.title?.trim();

  if (!title) {
    throw new Error(
      'O título da tarefa é obrigatório.',
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Normalize column                                                       */
  /* ---------------------------------------------------------------------- */

  const columnId =
    normalizeNullableString(
      input.columnId,
    );

  /* ---------------------------------------------------------------------- */
  /* Calculate position                                                     */
  /* ---------------------------------------------------------------------- */

  let positionQuery =
    supabase
      .from('tasks')
      .select(
        'position',
      )
      .order(
        'position',
        {
          ascending:
            false,
        },
      )
      .limit(1);

  if (columnId) {
    positionQuery =
      positionQuery.eq(
        'column_id',
        columnId,
      );
  } else {
    positionQuery =
      positionQuery.is(
        'column_id',
        null,
      );
  }

  if (
    scope.type ===
    'general'
  ) {
    positionQuery =
      positionQuery.is(
        'project_id',
        null,
      );
  } else {
    positionQuery =
      positionQuery.eq(
        'project_id',
        projectId,
      );
  }

  const {
    data:
      positionRows,
    error:
      positionError,
  } =
    await positionQuery;

  if (positionError) {
    throw new Error(
      `Failed to calculate task position: ${positionError.message}`,
    );
  }

  const position =
    (
      positionRows?.[0]
        ?.position ?? -1
    ) + 1;

  /* ---------------------------------------------------------------------- */
  /* Create task                                                            */
  /* ---------------------------------------------------------------------- */

  const {
    data,
    error,
  } =
    await supabase
      .from('tasks')
      .insert({
        project_id:
          projectId,

        column_id:
          columnId,

        title,

        description:
          input.description?.trim() ||
          null,

        priority,

        start_date:
          input.startDate ??
          null,

        due_date:
          input.dueDate ??
          null,

        estimated_hours:
          input.estimatedHours ??
          null,

        position,
      })
      .select(
        'task_id',
      )
      .single();

  if (error) {
    throw new Error(
      `Failed to create task: ${error.message}`,
    );
  }

  const taskId =
    data.task_id;

  /* ---------------------------------------------------------------------- */
  /* Add task member                                                        */
  /* ---------------------------------------------------------------------- */

  /*
   * IMPORTANT:
   *
   * Every task created without an explicit
   * assignee is automatically assigned to
   * the current authenticated user.
   *
   * If the UI explicitly selected another
   * user, that user becomes the member instead.
   */
  const memberProfileId =
    input.assignedTo ??
    currentProfileId;

  const {
    error:
      memberError,
  } =
    await supabase
      .from('task_members')
      .insert({
        task_id:
          taskId,

        profile_id:
          memberProfileId,
      });

  if (memberError) {
    /*
     * Remove the task if the member
     * insertion fails.
     */
    await supabase
      .from('tasks')
      .delete()
      .eq(
        'task_id',
        taskId,
      );

    throw new Error(
      `Failed to assign task member: ${memberError.message}`,
    );
  }

  return getTask(
    taskId,
  );
}

/* -------------------------------------------------------------------------- */
/* Update task                                                                */
/* -------------------------------------------------------------------------- */

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const supabase =
    await getSupabase();

  if (!taskId) {
    throw new Error(
      'Task ID is required.',
    );
  }

  const payload: Record<
    string,
    unknown
  > = {};

  /* ---------------------------------------------------------------------- */
  /* Task fields                                                            */
  /* ---------------------------------------------------------------------- */

  if (
    input.title !==
    undefined
  ) {
    const title =
      input.title.trim();

    if (!title) {
      throw new Error(
        'O título da tarefa é obrigatório.',
      );
    }

    payload.title =
      title;
  }

  if (
    input.description !==
    undefined
  ) {
    payload.description =
      input.description?.trim() ||
      null;
  }

  if (
    input.columnId !==
    undefined
  ) {
    payload.column_id =
      normalizeNullableString(
        input.columnId,
      );
  }

  if (
    input.priority !==
    undefined
  ) {
    payload.priority =
      normalizePriority(
        input.priority,
      );
  }

  if (
    input.startDate !==
    undefined
  ) {
    payload.start_date =
      input.startDate ||
      null;
  }

  if (
    input.dueDate !==
    undefined
  ) {
    payload.due_date =
      input.dueDate ||
      null;
  }

  if (
    input.estimatedHours !==
    undefined
  ) {
    payload.estimated_hours =
      input.estimatedHours ??
      null;
  }

  if (
    input.actualHours !==
    undefined
  ) {
    payload.actual_hours =
      input.actualHours ??
      null;
  }

  if (
    input.completed !==
    undefined
  ) {
    payload.completed =
      Boolean(
        input.completed,
      );
  }

  /* ---------------------------------------------------------------------- */
  /* Update task                                                            */
  /* ---------------------------------------------------------------------- */

  if (
    Object.keys(payload)
      .length > 0
  ) {
    const {
      error,
    } =
      await supabase
        .from('tasks')
        .update(
          payload,
        )
        .eq(
          'task_id',
          taskId,
        );

    if (error) {
      console.error(
        'Failed to update task:',
        {
          taskId,
          payload,
          error,
        },
      );

      throw new Error(
        `Failed to update task: ${error.message}`,
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Update assignment                                                      */
  /* ---------------------------------------------------------------------- */

  if (
    input.assignedTo !==
    undefined
  ) {
    /*
     * Remove existing assignment.
     */
    const {
      error:
        deleteMemberError,
    } =
      await supabase
        .from(
          'task_members',
        )
        .delete()
        .eq(
          'task_id',
          taskId,
        );

    if (
      deleteMemberError
    ) {
      throw new Error(
        `Failed to update task member: ${deleteMemberError.message}`,
      );
    }

    /*
     * If the new assignee is provided,
     * insert them.
     *
     * If assignedTo is null/empty,
     * the task becomes unassigned.
     */
    if (
      input.assignedTo
    ) {
      const {
        error:
          memberError,
      } =
        await supabase
          .from(
            'task_members',
          )
          .insert({
            task_id:
              taskId,

            profile_id:
              input.assignedTo,
          });

      if (
        memberError
      ) {
        throw new Error(
          `Failed to assign task member: ${memberError.message}`,
        );
      }
    }
  }

  return getTask(
    taskId,
  );
}

/* -------------------------------------------------------------------------- */
/* Delete task                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteTask(
  taskId: string,
): Promise<void> {
  const supabase =
    await getSupabase();

  const {
    error,
  } =
    await supabase
      .from('tasks')
      .delete()
      .eq(
        'task_id',
        taskId,
      );

  if (error) {
    throw new Error(
      `Failed to delete task: ${error.message}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Reorder tasks                                                              */
/* -------------------------------------------------------------------------- */

export async function reorderTasks(
  scope: TaskScope,
  columnId: string,
  orderedTaskIds: string[],
): Promise<void> {
  const supabase =
    await getSupabase();

  if (!columnId) {
    throw new Error(
      'Column ID is required.',
    );
  }

  if (
    orderedTaskIds.length ===
    0
  ) {
    return;
  }

  for (
    let index = 0;
    index <
    orderedTaskIds.length;
    index += 1
  ) {
    const taskId =
      orderedTaskIds[index];

    let query =
      supabase
        .from('tasks')
        .update({
          column_id:
            columnId,

          position:
            index,
        })
        .eq(
          'task_id',
          taskId,
        );

    if (
      scope.type ===
      'general'
    ) {
      query =
        query.is(
          'project_id',
          null,
        );
    } else {
      query =
        query.eq(
          'project_id',
          scope.projectId,
        );
    }

    const {
      error,
    } = await query;

    if (error) {
      throw new Error(
        `Failed to reorder task: ${error.message}`,
      );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Get complete Kanban board                                                 */
/* -------------------------------------------------------------------------- */

export async function getKanbanBoard(
  scope: TaskScope,
): Promise<KanbanBoardData> {
  const [
    { getTaskColumns },
    tasks,
  ] = await Promise.all([
    import('./task_columns'),
    getTasks(scope),
  ]);

  const columns =
    await getTaskColumns(
      scope,
    );

  return {
    scope,
    columns,
    tasks,
  };
}