import { createClient } from '@/app/lib/supabase/server';
import type { CreateTaskInput, KanbanBoardData, Task, TaskScope, UpdateTaskInput } from '../types';
import { cookies } from 'next/headers';

function mapTask(row: any): Task {
  const members = Array.isArray(row.task_members) ? row.task_members : [];
  return {
    taskId: row.task_id,
    projectId: row.project_id,
    columnId: row.column_id,
    assignedTo: row.assigned_to,
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
    members: members.map((item: any) => ({
      profileId: item.profile_id,
      firstName: item.profiles?.first_name ?? '',
      lastName: item.profiles?.last_name ?? '',
      picture: item.profiles?.profile_picture ?? null,
    })),
  };
}

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}


export async function getTasks(scope: TaskScope) {
  const supabase = await getSupabase();

  let query = supabase
    .from('tasks')
    .select(`
      task_id,
      project_id,
      column_id,
      assigned_to,
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
    `)
    .order('position', { ascending: true });

  const { data, error } = scope.type === 'general'
    ? await query.is('project_id', null)
    : await query.eq('project_id', scope.projectId);
  if (error) throw new Error(`Failed to load tasks: ${error.message}`);
  return (data ?? []).map(mapTask);
}

export async function getTask(taskId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      task_id,
      project_id,
      column_id,
      assigned_to,
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
    `)
    .eq('task_id', taskId)
    .single();

  if (error) throw new Error(`Failed to load task: ${error.message}`);
  return mapTask(data);
}

export async function createTask(scope: TaskScope, input: CreateTaskInput) {
  const supabase = await getSupabase();
  const projectId = scope.type === 'general' ? null : scope.projectId;

  const { data: positionRows, error: positionError } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', input.columnId ?? '')
    .order('position', { ascending: false })
    .limit(1);

  if (positionError) throw new Error(`Failed to calculate task position: ${positionError.message}`);

  const position = (positionRows?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      column_id: input.columnId ?? null,
      assigned_to: input.assignedTo ?? null,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'Medium',
      start_date: input.startDate ?? null,
      due_date: input.dueDate ?? null,
      estimated_hours: input.estimatedHours ?? null,
      position,
    })
    .select('task_id')
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  return getTask(data.task_id);
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const supabase = await getSupabase();
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.columnId !== undefined) payload.column_id = input.columnId;
  if (input.assignedTo !== undefined) payload.assigned_to = input.assignedTo;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.startDate !== undefined) payload.start_date = input.startDate;
  if (input.dueDate !== undefined) payload.due_date = input.dueDate;
  if (input.estimatedHours !== undefined) payload.estimated_hours = input.estimatedHours;
  if (input.actualHours !== undefined) payload.actual_hours = input.actualHours;
  if (input.completed !== undefined) payload.completed = input.completed;

  const { error } = await supabase.from('tasks').update(payload).eq('task_id', taskId);
  if (error) throw new Error(`Failed to update task: ${error.message}`);

  return getTask(taskId);
}

export async function deleteTask(taskId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('tasks').delete().eq('task_id', taskId);
  if (error) throw new Error(`Failed to delete task: ${error.message}`);
}

export async function reorderTasks(scope: TaskScope, columnId: string, orderedTaskIds: string[]) {
  const supabase = await getSupabase();

  for (let index = 0; index < orderedTaskIds.length; index += 1) {
    const taskId = orderedTaskIds[index];
    let query = supabase.from('tasks').update({ column_id: columnId, position: index }).eq('task_id', taskId);
    if (scope.type === 'general') query = query.is('project_id', null);
    else query = query.eq('project_id', scope.projectId);

    const { error } = await query;
    if (error) throw new Error(`Failed to reorder task: ${error.message}`);
  }
}

export async function getKanbanBoard(scope: TaskScope): Promise<KanbanBoardData> {
  const [{ getTaskColumns }, tasks] = await Promise.all([
    import('./task_columns'),
    getTasks(scope),
  ]);

  const columns = await getTaskColumns(scope);
  return { scope, columns, tasks };
}
