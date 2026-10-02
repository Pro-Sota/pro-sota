import { createClient } from '@/app/lib/supabase/server';
import type { CreateColumnInput, KanbanColumn, TaskScope } from '../types';
import { cookies } from 'next/headers';

function mapColumn(row: any): KanbanColumn {
  return {
    columnId: row.column_id,
    projectId: row.project_id,
    name: row.name,
    position: row.position,
    isCompleted: row.is_completed,
  };
}

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

export async function getTaskColumns(scope: TaskScope) {
  const supabase = await getSupabase();
  let query = supabase.from('task_columns').select('column_id, project_id, name, position, is_completed').order('position', { ascending: true });
  query = scope.type === 'general' ? query.is('project_id', null) : query.eq('project_id', scope.projectId);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load task columns: ${error.message}`);
  return (data ?? []).map(mapColumn);
}

export async function createTaskColumn(scope: TaskScope, input: CreateColumnInput) {
  const supabase = await getSupabase();
    const projectId = scope.type === 'general' ? null : scope.projectId;

  // The query above is intentionally broad; position is board-local, so calculate it again with the correct scope.
  let positionQuery = supabase.from('task_columns').select('position').order('position', { ascending: false }).limit(1);
  positionQuery = scope.type === 'general' ? positionQuery.is('project_id', null) : positionQuery.eq('project_id', scope.projectId);
  const { data: scopedRows, error: scopedError } = await positionQuery;
  if (scopedError) throw new Error(`Failed to calculate column position: ${scopedError.message}`);

  const position = (scopedRows?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from('task_columns')
    .insert({ project_id: projectId, name: input.name, position, is_completed: input.isCompleted ?? false })
    .select('column_id, project_id, name, position, is_completed')
    .single();

  if (error) throw new Error(`Failed to create task column: ${error.message}`);
  return mapColumn(data);
}

export async function updateTaskColumn(columnId: string, input: Partial<CreateColumnInput>) {
  const supabase = await getSupabase();
    const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.isCompleted !== undefined) payload.is_completed = input.isCompleted;

  const { data, error } = await supabase
    .from('task_columns')
    .update(payload)
    .eq('column_id', columnId)
    .select('column_id, project_id, name, position, is_completed')
    .single();

  if (error) throw new Error(`Failed to update task column: ${error.message}`);
  return mapColumn(data);
}

export async function deleteTaskColumn(columnId: string) {
  const supabase = await getSupabase();

  const { count, error: countError } = await supabase
    .from('tasks')
    .select('task_id', { count: 'exact', head: true })
    .eq('column_id', columnId);

  if (countError) throw new Error(`Failed to check task column: ${countError.message}`);
  if ((count ?? 0) > 0) {
    throw new Error('Não é possível eliminar uma lista que contém tarefas. Mova as tarefas primeiro.');
  }

  const { error } = await supabase.from('task_columns').delete().eq('column_id', columnId);
  if (error) throw new Error(`Failed to delete task column: ${error.message}`);
}

export async function reorderTaskColumns(scope: TaskScope, orderedColumnIds: string[]) {
  const supabase = await getSupabase();
  for (let index = 0; index < orderedColumnIds.length; index += 1) {
    let query = supabase.from('task_columns').update({ position: index }).eq('column_id', orderedColumnIds[index]);
    if (scope.type === 'general') query = query.is('project_id', null);
    else query = query.eq('project_id', scope.projectId);

    const { error } = await query;
    if (error) throw new Error(`Failed to reorder task columns: ${error.message}`);
  }
}
