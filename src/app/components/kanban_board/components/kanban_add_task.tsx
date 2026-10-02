'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState('');

  function submit() {
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  }

  return (
    <div className="mt-5 flex gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && submit()}
        placeholder="Nova tarefa..."
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
      <button type="button" onClick={submit} aria-label="Adicionar tarefa" className="rounded-xl bg-slate-800 px-3 py-2 text-white hover:bg-slate-700">
        <Plus size={16} />
      </button>
    </div>
  );
}
