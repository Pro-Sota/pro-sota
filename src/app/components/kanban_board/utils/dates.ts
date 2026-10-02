export function isOverdue(date?: string | null, completed = false) {
  if (!date || completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${date}T00:00:00`);
  return due < today;
}

export function formatDueDate(date?: string | null) {
  if (!date) return '';

  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
  });
}