'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function AddColumn({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  function submit() {
    if (!name.trim()) return;
    onAdd(name);
    setName('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex h-fit w-80 flex-shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500 transition hover:border-slate-400 hover:bg-white hover:text-slate-700">
        <Plus size={16} />
        Nova lista
      </button>
    );
  }

  return (
    <div className="h-fit w-80 flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Nome da lista" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={submit} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Adicionar</button>
        <button type="button" onClick={() => { setOpen(false); setName(''); }} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancelar</button>
      </div>
    </div>
  );
}
