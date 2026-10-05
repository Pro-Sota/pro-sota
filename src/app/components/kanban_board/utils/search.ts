import type { Task } from '../types';

export function taskMatchesSearch(task: Task, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  return [
    task.title,
    task.description ?? '',
    task.priority,
    ...task.members.flatMap((member) => [member.firstName, member.lastName]),
  ].some((field) => field.toLowerCase().includes(value));
}
