'use client';

import React, { useMemo, useState } from 'react';
import { Check, X, Eye, Plus, FileText, Inbox } from 'lucide-react';
import ActionButton from './components/action_button';
import StatusBadge from './components/status_badge';
import SummaryCard from './components/summary_card';
import { INITIAL_SUBMISSIONS } from './data';





export default function ApprovalsAndReviewsPage() {
    const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
    const [toast, setToast] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const counts = useMemo(
        () => ({
            pending: submissions.filter((s) => s.status === 'Under Review').length,
            approved: submissions.filter((s) => s.status === 'Approved').length,
            changesRequested: submissions.filter((s) => s.status === 'Changes Requested').length,
            overdue: 0,
        }),
        [submissions]
    );

    const filteredSubmissions = useMemo(() => {
        switch (activeFilter) {
            case 'pending':
                return submissions.filter((s) => s.status === 'Under Review');
            case 'approved':
                return submissions.filter((s) => s.status === 'Approved');
            case 'changesRequested':
                return submissions.filter((s) => s.status === 'Changes Requested');
            case 'overdue':
                return [];
            default:
                return submissions;
        }
    }, [submissions, activeFilter]);

    const timeoutRef = useRef(null);

    const showToast = (message) => {
        setToast(message);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    const toggleFilter = (filter: string) => {
        setActiveFilter((current) => (current === filter ? 'all' : filter));
    };

    const handleQuickApprove = (id: number) => {
        const target = submissions.find((s) => s.id === id);
        if (!target || target.status === 'Approved') return;
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Approved' } : s)));
        showToast(`Approved "${target.title}"`);
    };

    const handleQuickReject = (id: number) => {
        const target = submissions.find((s) => s.id === id);
        if (!target || target.status === 'Rejected') return;
        if (!window.confirm(`Reject "${target.title}"?`)) return;
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Rejected' } : s)));
        showToast(`Rejected "${target.title}"`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 sm:p-6 space-y-6 text-gray-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Aprovações e Revisões</h1>
                <button
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg
                        hover:bg-slate-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Nova Submissão
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                    label="Comentários pendentes"
                    value={counts.pending}
                    active={activeFilter === 'pending'}
                    onClick={() => toggleFilter('pending')}
                />
                <SummaryCard
                    label="Aprovados"
                    value={counts.approved}
                    valueClassName="text-green-600"
                    active={activeFilter === 'approved'}
                    onClick={() => toggleFilter('approved')}
                />
                <SummaryCard
                    label="Pedidos de mudança"
                    value={counts.changesRequested}
                    valueClassName="text-orange-500"
                    active={activeFilter === 'changesRequested'}
                    onClick={() => toggleFilter('changesRequested')}
                />
                <SummaryCard
                    label="Fora de prazo"
                    value={counts.overdue}
                    valueClassName="text-red-600"
                    active={activeFilter === 'overdue'}
                    onClick={() => toggleFilter('overdue')}
                />
            </div>

            {/* Submissions panel */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">Submissions</h2>
                    {activeFilter !== 'all' && (
                        <button
                            onClick={() => setActiveFilter('all')}
                            className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:underline"
                        >
                            Limpar filtro
                        </button>
                    )}
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div className="p-12 flex flex-col items-center text-center gap-2">
                        <Inbox className="text-gray-300" size={32} strokeWidth={1.5} />
                        <p className="text-sm text-gray-400">Sem submissões para este filtro.</p>
                    </div>
                ) : (
                    <>
                        {/* Table — sm and up */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-500">Documentos</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Tipo</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Submetido Por</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Data</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Estado</th>
                                        <th className="text-right p-4 font-medium text-gray-500">Acções</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubmissions.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900 max-w-xs truncate" title={item.title}>
                                                {item.title}
                                            </td>
                                            <td className="p-4 text-gray-600">{item.type}</td>
                                            <td className="p-4 text-gray-600">{item.submittedBy}</td>
                                            <td className="p-4 text-gray-600 whitespace-nowrap">{item.date}</td>
                                            <td className="p-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-1">
                                                    {item.status !== 'Approved' && (
                                                        <ActionButton
                                                            onClick={() => handleQuickApprove(item.id)}
                                                            icon={Check}
                                                            label="Aprovar"
                                                            tone="green"
                                                        />
                                                    )}
                                                    {item.status !== 'Rejected' && (
                                                        <ActionButton
                                                            onClick={() => handleQuickReject(item.id)}
                                                            icon={X}
                                                            label="Rejeitar"
                                                            tone="red"
                                                        />
                                                    )}
                                                    <ActionButton onClick={() => { }} icon={Eye} label="Ver" tone="blue" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards — below sm */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {filteredSubmissions.map((item) => (
                                <div key={item.id} className="p-4 space-y-3">
                                    <div className="flex items-start gap-2">
                                        <FileText className="text-gray-400 mt-0.5 shrink-0" size={16} />
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{item.submittedBy}</span>
                                        <span>{item.date}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={item.status} />
                                        <div className="flex gap-1">
                                            {item.status !== 'Approved' && (
                                                <ActionButton
                                                    onClick={() => handleQuickApprove(item.id)}
                                                    icon={Check}
                                                    label="Aprovar"
                                                    tone="green"
                                                />
                                            )}
                                            {item.status !== 'Rejected' && (
                                                <ActionButton
                                                    onClick={() => handleQuickReject(item.id)}
                                                    icon={X}
                                                    label="Rejeitar"
                                                    tone="red"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {toast && (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-2xl">
                    {toast}
                </div>
            )}
        </div>
    );
}