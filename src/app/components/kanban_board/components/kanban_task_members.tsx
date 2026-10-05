'use client';

import { Plus, X } from 'lucide-react';
import type { TaskMember } from '../types';
import { getAvatarColor, getInitials } from '../utils/avatar';


export default function TaskMembers({ members, onAdd, onRemove }: { members: TaskMember[]; onAdd: () => void; onRemove: (profileId: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Membros</p>
        <button type="button" onClick={onAdd} aria-label="Adicionar membro" className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800">
          <Plus size={14} />
        </button>
      </div>
      {members.length === 0 ? <p className="text-sm text-slate-400">Sem membros atribuídos.</p> : (
        <div className="flex flex-wrap gap-2">
          {members.map((member) => {
            const name = `${member.firstName} ${member.lastName}`.trim();
            return (
              <span key={member.profileId} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold text-white ${getAvatarColor()}`}>{getInitials(member.firstName, member.lastName)}</span>
                <span className="text-xs font-medium text-slate-700">{name}</span>
                <button type="button" onClick={() => onRemove(member.profileId)} aria-label={`Remover ${name}`} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}