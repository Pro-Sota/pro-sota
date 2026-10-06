"use server";

import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type {
  CreateTaskInput,
  KanbanBoardData,
  Task,
  TaskMember,
  TaskScope,
  UpdateTaskInput,
} from "../types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const VALID_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type TaskPriority =
  (typeof VALID_PRIORITIES)[number];

const PRIORITY_MAP: Record<string, TaskPriority> = {
  low: "Low",
  baixa: "Low",

  medium: "Medium",
  media: "Medium",
  média: "Medium",

  high: "High",
  alta: "High",

  critical: "Critical",
  critica: "Critical",
  crítica: "Critical",
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
    typeof value === "string" &&
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

  if (typeof value !== "string") {
    return "Medium";
  }

  const normalized = value
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "Medium";
  }

  return (
    PRIORITY_MAP[normalized] ??
    "Medium"
  );
}

function normalizeNullableString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  return value.trim();
}

function normalizeMemberIds(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(
          (id): id is string =>
            typeof id === "string" &&
            id.trim().length > 0,
        )
        .map((id) => id.trim()),
    ),
  ];
}

/* -------------------------------------------------------------------------- */
/* Task mapper                                                                */
/* -------------------------------------------------------------------------- */

function mapTask(row: any): Task {
  const members: TaskMemberRow[] =
    Array.isArray(row.task_members)
      ? row.task_members
      : [];

  return {
    taskId: row.task_id,

    projectId:
      row.project_id ?? null,

    createdBy:
      row.created_by,

    columnId:
      row.column_id ?? null,

    title:
      row.title,

    description:
      row.description ?? null,

    priority:
      normalizePriority(
        row.priority,
      ).toLowerCase() as Task["priority"],

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
        (item): TaskMember => {
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
              "",

            lastName:
              profile?.last_name ??
              "",
          };
        },
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore =
    await cookies();

  return createClient(
    cookieStore,
  );
}

/* -------------------------------------------------------------------------- */
/* Current user                                                               */
/* -------------------------------------------------------------------------- */

async function getCurrentUserId(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
): Promise<string> {
  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser();

  if (
    error ||
    !user
  ) {
    throw new Error(
      "Utilizador não autenticado.",
    );
  }

  return user.id;
}

/* -------------------------------------------------------------------------- */
/* Current profile                                                            */
/* -------------------------------------------------------------------------- */

async function getCurrentProfileId(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
): Promise<string> {
  const userId =
    await getCurrentUserId(
      supabase,
    );

  const {
    data: profile,
    error,
  } =
    await supabase
      .from("profiles")
      .select(
        "profile_id",
      )
      .eq(
        "profile_id",
        userId,
      )
      .single();

  if (
    error ||
    !profile
  ) {
    throw new Error(
      "Perfil do utilizador não encontrado.",
    );
  }

  return profile.profile_id;
}

/* -------------------------------------------------------------------------- */
/* Project membership                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Project access rule:
 *
 * A user can access a project only when a row exists in
 * project_members for:
 *
 *     project_id = selected project
 *     profile_id = authenticated user
 */
async function assertProjectMember(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
  projectId: string,
): Promise<string> {
  if (!projectId) {
    throw new Error(
      "Project ID is required.",
    );
  }

  const userId =
    await getCurrentUserId(
      supabase,
    );

  const {
    data: member,
    error,
  } =
    await supabase
      .from("project_members")
      .select(
        "project_id",
      )
      .eq(
        "project_id",
        projectId,
      )
      .eq(
        "profile_id",
        userId,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to verify project membership: ${error.message}`,
    );
  }

  if (!member) {
    throw new Error(
      "Não tem acesso a este projecto.",
    );
  }

  return userId;
}

/* -------------------------------------------------------------------------- */
/* Validate project task members                                              */
/* -------------------------------------------------------------------------- */

/**
 * Project tasks may only be assigned to people who are
 * members of the same project.
 */
async function validateProjectMemberIds(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
  projectId: string,
  profileIds: string[],
): Promise<void> {
  if (
    profileIds.length === 0
  ) {
    return;
  }

  const {
    data: members,
    error,
  } =
    await supabase
      .from("project_members")
      .select(
        "profile_id",
      )
      .eq(
        "project_id",
        projectId,
      )
      .in(
        "profile_id",
        profileIds,
      );

  if (error) {
    throw new Error(
      `Failed to validate task members: ${error.message}`,
    );
  }

  const validIds =
    new Set(
      (members ?? []).map(
        (member) =>
          member.profile_id,
      ),
    );

  const invalidIds =
    profileIds.filter(
      (profileId) =>
        !validIds.has(
          profileId,
        ),
    );

  if (
    invalidIds.length > 0
  ) {
    throw new Error(
      "Uma ou mais pessoas seleccionadas não pertencem ao projecto.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Shared task select                                                         */
/* -------------------------------------------------------------------------- */

const TASK_SELECT = `
  task_id,
  project_id,
  created_by,
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
/* Get tasks                                                                  */
/* -------------------------------------------------------------------------- */

export async function getTasks(
  scope: TaskScope,
): Promise<Task[]> {
  const supabase =
    await getSupabase();

  const currentUserId =
    await getCurrentUserId(
      supabase,
    );

  let query = supabase
    .from("tasks")
    .select(
      TASK_SELECT,
    )
    .order(
      "position",
      {
        ascending: true,
      },
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    );

  /* ---------------------------------------------------------------------- */
  /* General board                                                          */
  /* ---------------------------------------------------------------------- */

  if (
    scope.type ===
    "general"
  ) {
    /*
     * General tasks are personal.
     *
     * The task must:
     * - have no project
     * - have been created by the current user
     */
    query = query
      .is(
        "project_id",
        null,
      )
      .eq(
        "created_by",
        currentUserId,
      );
  }

  /* ---------------------------------------------------------------------- */
  /* Project board                                                          */
  /* ---------------------------------------------------------------------- */

  else {
    /*
     * Project tasks are shared only with project members.
     */
    await assertProjectMember(
      supabase,
      scope.projectId,
    );

    query = query.eq(
      "project_id",
      scope.projectId,
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
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

  const currentUserId =
    await getCurrentUserId(
      supabase,
    );

  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("tasks")
      .select(
        TASK_SELECT,
      )
      .eq(
        "task_id",
        taskId,
      )
      .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      `Failed to load task: ${
        error?.message ??
        "Tarefa não encontrada."
      }`,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* General task                                                           */
  /* ---------------------------------------------------------------------- */

  if (
    data.project_id ===
    null
  ) {
    /*
     * Personal tasks can only be accessed
     * by their creator.
     */
    if (
      data.created_by !==
      currentUserId
    ) {
      throw new Error(
        "Não tem acesso a esta tarefa.",
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Project task                                                           */
  /* ---------------------------------------------------------------------- */

  else {
    /*
     * Project tasks can only be accessed
     * by project members.
     */
    await assertProjectMember(
      supabase,
      data.project_id,
    );
  }

  return mapTask(data);
}

/* -------------------------------------------------------------------------- */
/* Validate task column                                                       */
/* -------------------------------------------------------------------------- */

async function validateTaskColumn(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
  scope: TaskScope,
  columnId: string,
  currentProfileId: string,
) {
  const {
    data: column,
    error,
  } =
    await supabase
      .from("task_columns")
      .select(
        "column_id, project_id, profile_id",
      )
      .eq(
        "column_id",
        columnId,
      )
      .single();

  if (
    error ||
    !column
  ) {
    throw new Error(
      "A coluna selecionada não existe.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* General column                                                         */
  /* ---------------------------------------------------------------------- */

  if (
    scope.type ===
    "general"
  ) {
    /*
     * Personal column must:
     *
     * project_id = NULL
     * profile_id = current user
     */
    if (
      column.project_id !==
        null ||
      column.profile_id !==
        currentProfileId
    ) {
      throw new Error(
        "A coluna não pertence ao seu quadro pessoal.",
      );
    }

    return column;
  }

  /* ---------------------------------------------------------------------- */
  /* Project column                                                         */
  /* ---------------------------------------------------------------------- */

  /*
   * Column must belong to this project.
   */
  if (
    column.project_id !==
    scope.projectId
  ) {
    throw new Error(
      "A coluna não pertence a este projecto.",
    );
  }

  /*
   * User must be a member of this project.
   */
  await assertProjectMember(
    supabase,
    scope.projectId,
  );

  return column;
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

  const currentUserId =
    await getCurrentUserId(
      supabase,
    );

  const currentProfileId =
    await getCurrentProfileId(
      supabase,
    );

  /* ---------------------------------------------------------------------- */
  /* Determine scope                                                        */
  /* ---------------------------------------------------------------------- */

  let projectId: string | null =
    null;

  if (
    scope.type ===
    "project"
  ) {
    /*
     * User must belong to the project
     * before creating a task there.
     */
    await assertProjectMember(
      supabase,
      scope.projectId,
    );

    projectId =
      scope.projectId;
  }

  /* ---------------------------------------------------------------------- */
  /* Validate basic fields                                                  */
  /* ---------------------------------------------------------------------- */

  const title =
    input.title?.trim();

  if (!title) {
    throw new Error(
      "O título da tarefa é obrigatório.",
    );
  }

  const priority =
    normalizePriority(
      input.priority,
    );

  const columnId =
    normalizeNullableString(
      input.columnId,
    );

  /* ---------------------------------------------------------------------- */
  /* Validate column                                                        */
  /* ---------------------------------------------------------------------- */

  if (columnId) {
    await validateTaskColumn(
      supabase,
      scope,
      columnId,
      currentProfileId,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Validate assignments                                                   */
  /* ---------------------------------------------------------------------- */

  const memberIds =
    normalizeMemberIds(
      input.memberIds,
    );

  if (
    scope.type ===
    "project"
  ) {
    /*
     * Project tasks can only be assigned
     * to members of the same project.
     */
    await validateProjectMemberIds(
      supabase,
      scope.projectId,
      memberIds,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Calculate position                                                     */
  /* ---------------------------------------------------------------------- */

  let positionQuery =
    supabase
      .from("tasks")
      .select(
        "position",
      )
      .order(
        "position",
        {
          ascending:
            false,
        },
      )
      .limit(1);

  if (columnId) {
    positionQuery =
      positionQuery.eq(
        "column_id",
        columnId,
      );
  } else {
    positionQuery =
      positionQuery.is(
        "column_id",
        null,
      );
  }

  if (
    scope.type ===
    "general"
  ) {
    positionQuery =
      positionQuery
        .is(
          "project_id",
          null,
        )
        .eq(
          "created_by",
          currentUserId,
        );
  } else {
    positionQuery =
      positionQuery.eq(
        "project_id",
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
      .from("tasks")
      .insert({
        project_id:
          projectId,

        /*
         * tasks.created_by references auth.users(id).
         */
        created_by:
          currentUserId,

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
        "task_id",
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
  /* Assign members                                                         */
  /* ---------------------------------------------------------------------- */

  if (
    memberIds.length > 0
  ) {
    const {
      error:
        memberError,
    } =
      await supabase
        .from(
          "task_members",
        )
        .insert(
          memberIds.map(
            (profileId) => ({
              task_id:
                taskId,

              profile_id:
                profileId,
            }),
          ),
        );

    if (
      memberError
    ) {
      /*
       * Clean up task if assignment fails.
       */
      await supabase
        .from("tasks")
        .delete()
        .eq(
          "task_id",
          taskId,
        );

      throw new Error(
        `Failed to assign task members: ${memberError.message}`,
      );
    }
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

  const currentUserId =
    await getCurrentUserId(
      supabase,
    );

  const currentProfileId =
    await getCurrentProfileId(
      supabase,
    );

  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Load existing task                                                     */
  /* ---------------------------------------------------------------------- */

  const {
    data: existingTask,
    error:
      existingTaskError,
  } =
    await supabase
      .from("tasks")
      .select(
        "task_id, project_id, created_by",
      )
      .eq(
        "task_id",
        taskId,
      )
      .single();

  if (
    existingTaskError ||
    !existingTask
  ) {
    throw new Error(
      "Tarefa não encontrada.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Verify task access                                                     */
  /* ---------------------------------------------------------------------- */

  if (
    existingTask.project_id ===
    null
  ) {
    /*
     * Personal task:
     * only creator can edit it.
     */
    if (
      existingTask.created_by !==
      currentUserId
    ) {
      throw new Error(
        "Não tem permissão para editar esta tarefa.",
      );
    }
  } else {
    /*
     * Project task:
     * user must be a project member.
     */
    await assertProjectMember(
      supabase,
      existingTask.project_id,
    );
  }

  const payload: Record<
    string,
    unknown
  > = {};

  /* ---------------------------------------------------------------------- */
  /* Basic fields                                                           */
  /* ---------------------------------------------------------------------- */

  if (
    input.title !==
    undefined
  ) {
    const title =
      input.title.trim();

    if (!title) {
      throw new Error(
        "O título da tarefa é obrigatório.",
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

  /* ---------------------------------------------------------------------- */
  /* Column                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    input.columnId !==
    undefined
  ) {
    const columnId =
      normalizeNullableString(
        input.columnId,
      );

    if (columnId) {
      const taskScope: TaskScope =
        existingTask.project_id ===
        null
          ? {
              type: "general",
              projectId: null,
            }
          : {
              type: "project",
              projectId:
                existingTask.project_id,
            };

      await validateTaskColumn(
        supabase,
        taskScope,
        columnId,
        currentProfileId,
      );
    }

    payload.column_id =
      columnId;
  }

  /* ---------------------------------------------------------------------- */
  /* Priority                                                                */
  /* ---------------------------------------------------------------------- */

  if (
    input.priority !==
    undefined
  ) {
    payload.priority =
      normalizePriority(
        input.priority,
      );
  }

  /* ---------------------------------------------------------------------- */
  /* Dates                                                                    */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Hours                                                                    */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Completed                                                                */
  /* ---------------------------------------------------------------------- */

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
  /* Update task                                                              */
  /* ---------------------------------------------------------------------- */

  if (
    Object.keys(payload)
      .length > 0
  ) {
    const {
      error,
    } =
      await supabase
        .from("tasks")
        .update(
          payload,
        )
        .eq(
          "task_id",
          taskId,
        );

    if (error) {
      throw new Error(
        `Failed to update task: ${error.message}`,
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Update assignments                                                      */
  /* ---------------------------------------------------------------------- */

  if (
    input.memberIds !==
    undefined
  ) {
    const memberIds =
      normalizeMemberIds(
        input.memberIds,
      );

    /*
     * Project tasks:
     * every assigned member must belong
     * to the same project.
     */
    if (
      existingTask.project_id !==
      null
    ) {
      await validateProjectMemberIds(
        supabase,
        existingTask.project_id,
        memberIds,
      );
    }

    /*
     * Delete previous assignments.
     */
    const {
      error:
        deleteMemberError,
    } =
      await supabase
        .from(
          "task_members",
        )
        .delete()
        .eq(
          "task_id",
          taskId,
        );

    if (
      deleteMemberError
    ) {
      throw new Error(
        `Failed to update task members: ${deleteMemberError.message}`,
      );
    }

    /*
     * Insert new assignments.
     */
    if (
      memberIds.length > 0
    ) {
      const {
        error:
          memberError,
      } =
        await supabase
          .from(
            "task_members",
          )
          .insert(
            memberIds.map(
              (profileId) => ({
                task_id:
                  taskId,

                profile_id:
                  profileId,
              }),
            ),
          );

      if (
        memberError
      ) {
        throw new Error(
          `Failed to assign task members: ${memberError.message}`,
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

  const currentUserId =
    await getCurrentUserId(
      supabase,
    );

  if (!taskId) {
    throw new Error(
      "Task ID is required.",
    );
  }

  const {
    data: task,
    error: taskError,
  } =
    await supabase
      .from("tasks")
      .select(
        "task_id, project_id, created_by",
      )
      .eq(
        "task_id",
        taskId,
      )
      .single();

  if (
    taskError ||
    !task
  ) {
    throw new Error(
      "Tarefa não encontrada.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Verify task access                                                     */
  /* ---------------------------------------------------------------------- */

  if (
    task.project_id ===
    null
  ) {
    /*
     * Personal task:
     * only creator can delete it.
     */
    if (
      task.created_by !==
      currentUserId
    ) {
      throw new Error(
        "Não tem permissão para eliminar esta tarefa.",
      );
    }
  } else {
    /*
     * Project task:
     * any project member can delete it.
     */
    await assertProjectMember(
      supabase,
      task.project_id,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Delete task                                                             */
  /* ---------------------------------------------------------------------- */

  const {
    error,
  } =
    await supabase
      .from("tasks")
      .delete()
      .eq(
        "task_id",
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

  const currentUserId =
    await getCurrentUserId(
      supabase,
    );

  const currentProfileId =
    await getCurrentProfileId(
      supabase,
    );

  if (!columnId) {
    throw new Error(
      "Column ID is required.",
    );
  }

  if (
    orderedTaskIds.length ===
    0
  ) {
    return;
  }

  /* ---------------------------------------------------------------------- */
  /* Verify board access                                                    */
  /* ---------------------------------------------------------------------- */

  if (
    scope.type ===
    "project"
  ) {
    await assertProjectMember(
      supabase,
      scope.projectId,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Verify destination column                                              */
  /* ---------------------------------------------------------------------- */

  await validateTaskColumn(
    supabase,
    scope,
    columnId,
    currentProfileId,
  );

  /* ---------------------------------------------------------------------- */
  /* Reorder                                                                 */
  /* ---------------------------------------------------------------------- */

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
        .from("tasks")
        .update({
          column_id:
            columnId,

          position:
            index,
        })
        .eq(
          "task_id",
          taskId,
        );

    /* -------------------------------------------------------------------- */
    /* General board                                                        */
    /* -------------------------------------------------------------------- */

    if (
      scope.type ===
      "general"
    ) {
      query =
        query
          .is(
            "project_id",
            null,
          )
          .eq(
            "created_by",
            currentUserId,
          );
    }

    /* -------------------------------------------------------------------- */
    /* Project board                                                        */
    /* -------------------------------------------------------------------- */

    else {
      query =
        query.eq(
          "project_id",
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
/* Get complete Kanban board                                                  */
/* -------------------------------------------------------------------------- */

export async function getKanbanBoard(
  scope: TaskScope,
): Promise<KanbanBoardData> {
  const {
    getTaskColumns,
  } = await import(
    "./task_columns"
  );

  const [
    tasks,
    columns,
  ] = await Promise.all([
    getTasks(scope),
    getTaskColumns(scope),
  ]);

  return {
    scope,
    columns,
    tasks,
  };
}