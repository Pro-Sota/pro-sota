'use client';

import React, { useMemo, useState } from 'react';

type SubmissionStatus = 'Under Review' | 'Changes Requested' | 'Approved' | 'Rejected';

interface Submission {
    id: number;
    title: string;
    submittedBy: string;
    date: string;
    status: SubmissionStatus;
    type: string;
}

const INITIAL_SUBMISSIONS: Submission[] = [
    { id: 1, title: 'Architectural Drawings - Revision 03', submittedBy: 'Carlos Mendes', date: '10 Jul 2026', status: 'Under Review', type: 'Design' },
    { id: 2, title: 'Structural Package - Revision 02', submittedBy: 'Ana Silva', date: '08 Jul 2026', status: 'Changes Requested', type: 'Technical' },
    { id: 3, title: 'Interior Materials Selection', submittedBy: 'João Costa', date: '05 Jul 2026', status: 'Approved', type: 'Client Approval' },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
    'Approved': 'bg-green-100 text-green-700',
    'Changes Requested': 'bg-orange-100 text-orange-700',
    'Under Review': 'bg-blue-100 text-blue-700',
    'Rejected': 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[status]}`}>
            {status}
        </span>
    );
}

function SummaryCard({ label, value, className = 'text-gray-800' }: { label: string; value: number; className?: string }) {
    return (
        <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">{label}</p>
            <h2 className={`text-3xl font-bold ${className}`}>{value}</h2>
        </div>
    );
}

export default function ApprovalsAndReviewsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
    const [toast, setToast] = useState<string | null>(null);

    const counts = useMemo(() => ({
        pending: submissions.filter((s) => s.status === 'Under Review').length,
        approved: submissions.filter((s) => s.status === 'Approved').length,
        changesRequested: submissions.filter((s) => s.status === 'Changes Requested').length,
        // Placeholder until submissions carry a real due date to compare against.
        overdue: 0,
    }), [submissions]);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
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
        <div className="p-6 space-y-6 text-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Aprovações e Revisões</h1>
                </div>

                <button className="bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                    + Nova Submissão
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <SummaryCard label="Comentários pendentes" value={counts.pending} />
                <SummaryCard label="Aprovados" value={counts.approved} className="text-green-600" />
                <SummaryCard label="Pedidos de mudança" value={counts.changesRequested} className="text-orange-500" />
                <SummaryCard label="Fora de prazo" value={counts.overdue} className="text-red-600" />
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-xl shadow">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Submissions</h2>
                </div>

                {submissions.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-400">Sem sumbissões.</p>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-4">Documentos</th>
                                <th className="text-left p-4">Tipo</th>
                                <th className="text-left p-4">Submetido Por</th>
                                <th className="text-left p-4">Data</th>
                                <th className="text-left p-4">Estado</th>
                                <th className="text-right p-4">Acções</th>
                            </tr>
                        </thead>

                        <tbody>
                            {submissions.map((item) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 font-medium">{item.title}</td>
                                    <td className="p-4">{item.type}</td>
                                    <td className="p-4">{item.submittedBy}</td>
                                    <td className="p-4">{item.date}</td>
                                    <td className="p-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-3">
                                            {item.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleQuickApprove(item.id)}
                                                    className="cursor-pointer text-green-600 hover:underline text-sm font-medium"
                                                    title="Quick approve"
                                                >
                                                    ✓ Aprovar
                                                </button>
                                            )}
                                            {item.status !== 'Rejected' && (
                                                <button
                                                    onClick={() => handleQuickReject(item.id)}
                                                    className="cursor-pointer text-red-600 hover:underline text-sm font-medium"
                                                    title="Quick reject"
                                                >
                                                    ✕ Rejeitar
                                                </button>
                                            )}
                                            <button className="cursor-pointer text-blue-600 hover:underline text-sm font-medium">
                                                Ver
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-800 px-5 py-3 text-sm text-white shadow-2xl">
                    {toast}
                </div>
            )}
        </div>
    );
}