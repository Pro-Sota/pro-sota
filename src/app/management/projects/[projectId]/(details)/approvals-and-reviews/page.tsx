'use client';

import React, { useMemo, useState } from 'react';
import {
    Check,
    X,
    Eye,
    Plus,
    FileText,
    Inbox,
    Search,
    ArrowUpDown,
    AlertTriangle,
    PenTool,
    Wrench,
    ClipboardCheck,
} from 'lucide-react';
import clsx from 'clsx';

type SubmissionStatus = 'Approved' | 'Changes Requested' | 'Under Review' | 'Rejected';
type SubmissionType = 'Design' | 'Technical' | 'Client Approval';

type Submission = {
    id: number;
    title: string;
    submittedBy: string;
    date: string; // display string
    dueDate: string; // ISO, used for overdue logic
    status: SubmissionStatus;
    type: SubmissionType;
};

// "Today" for overdue comparisons — the app's current date.
const TODAY = new Date('2026-07-23');

const INITIAL_SUBMISSIONS: Submission[] = [
    {
        id: 1,
        title: 'Architectural Drawings - Revision 03',
        submittedBy: 'Carlos Mendes',
        date: '10 Jul 2026',
        dueDate: '2026-07-17',
        status: 'Under Review',
        type: 'Design',
    },
    {
        id: 2,
        title: 'Structural Package - Revision 02',
        submittedBy: 'Ana Silva',
        date: '08 Jul 2026',
        dueDate: '2026-07-15',
        status: 'Changes Requested',
        type: 'Technical',
    },
    {
        id: 3,
        title: 'Interior Materials Selection',
        submittedBy: 'João Costa',
        date: '05 Jul 2026',
        dueDate: '2026-07-12',
        status: 'Approved',
        type: 'Client Approval',
    },
    {
        id: 4,
        title: 'Facade Cladding Detail Package — Zone B North Elevation',
        submittedBy: 'Mariana Lopes',
        date: '02 Jul 2026',
        dueDate: '2026-07-09',
        status: 'Under Review',
        type: 'Technical',
    },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
    Approved: 'bg-green-100 text-green-700',
    'Changes Requested': 'bg-orange-100 text-orange-700',
    'Under Review': 'bg-blue-100 text-blue-700',
    Rejected: 'bg-red-100 text-red-700',
};

const TYPE_STYLES: Record<SubmissionType, { badge: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }> = {
    Design: { badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: PenTool },
    Technical: { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: Wrench },
    'Client Approval': { badge: 'bg-teal-50 text-teal-700 border-teal-200', icon: ClipboardCheck },
};

function isOverdue(s: Submission) {
    if (s.status !== 'Under Review' && s.status !== 'Changes Requested') return false;
    return new Date(s.dueDate).getTime() < TODAY.getTime();
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
        >
            {status}
        </span>
    );
}

function TypeBadge({ type }: { type: SubmissionType }) {
    const { badge, icon: Icon } = TYPE_STYLES[type];
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium',
                badge
            )}
        >
            <Icon size={12} strokeWidth={2.25} />
            {type}
        </span>
    );
}

type SummaryCardProps = {
    label: string;
    value: React.ReactNode;
    active?: boolean;
    valueClassName?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SummaryCard({
    label,
    value,
    active = false,
    valueClassName,
    className,
    ...props
}: SummaryCardProps) {
    return (
        <button
            type="button"
            aria-pressed={active}
            {...props}
            className={clsx(
                'group rounded-xl border bg-white p-4 text-left transition cursor-pointer',
                'hover:-translate-y-0.5 hover:shadow-md',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                active
                    ? 'border-slate-500 ring-1 ring-slate-500'
                    : 'border-gray-200 hover:border-gray-300',
                className
            )}
        >
            <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
                <span
                    className={clsx(
                        'text-gray-300 transition-opacity',
                        active ? 'opacity-100 text-slate-500' : 'opacity-0 group-hover:opacity-100'
                    )}
                    aria-hidden="true"
                >
                    {active ? '● filtered' : 'filter →'}
                </span>
            </p>

            <p className={clsx('mt-1 text-2xl font-semibold text-gray-900', valueClassName)}>
                {value}
            </p>
        </button>
    );
}

type ActionButtonProps = {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
    tone: 'green' | 'red' | 'blue';
    showLabel?: boolean;
};

function ActionButton({ onClick, icon: Icon, label, tone, showLabel = true }: ActionButtonProps) {
    const tones = {
        green: 'text-green-700 hover:bg-green-50 focus-visible:ring-green-500',
        red: 'text-red-700 hover:bg-red-50 focus-visible:ring-red-500',
        blue: 'text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500',
    };
    return (
        <button
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${tones[tone]}`}
        >
            <Icon size={15} strokeWidth={2.25} />
            {showLabel && <span>{label}</span>}
        </button>
    );
}

// Inline confirm swap — replaces a button with a Yes/Cancel pair instead of window.confirm().
function ConfirmInline({
    label,
    onConfirm,
    onCancel,
}: {
    label: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2 py-1">
            <span className="text-xs font-medium text-red-700 pl-1">{label}</span>
            <button
                onClick={onConfirm}
                className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
            >
                Sim
            </button>
            <button
                onClick={onCancel}
                className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
            >
                Cancelar
            </button>
        </div>
    );
}

function daysOverdue(s: Submission) {
    const diff = TODAY.getTime() - new Date(s.dueDate).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

type SortKey = 'date' | 'title' | 'status';

export default function ApprovalsAndReviewsPage() {
    const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
    const [toast, setToast] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortAsc, setSortAsc] = useState(false);
    const [pendingReject, setPendingReject] = useState<number | null>(null);
    const [detailItem, setDetailItem] = useState<Submission | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<SubmissionType>('Design');
    const [newSubmitter, setNewSubmitter] = useState('');

    const counts = useMemo(
        () => ({
            pending: submissions.filter((s) => s.status === 'Under Review').length,
            approved: submissions.filter((s) => s.status === 'Approved').length,
            changesRequested: submissions.filter((s) => s.status === 'Changes Requested').length,
            overdue: submissions.filter(isOverdue).length,
        }),
        [submissions]
    );

    const filteredSubmissions = useMemo(() => {
        let list = submissions;

        switch (activeFilter) {
            case 'pending':
                list = list.filter((s) => s.status === 'Under Review');
                break;
            case 'approved':
                list = list.filter((s) => s.status === 'Approved');
                break;
            case 'changesRequested':
                list = list.filter((s) => s.status === 'Changes Requested');
                break;
            case 'overdue':
                list = list.filter(isOverdue);
                break;
            default:
                break;
        }

        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.submittedBy.toLowerCase().includes(q)
            );
        }

        const sorted = [...list].sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'date') {
                cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else if (sortKey === 'title') {
                cmp = a.title.localeCompare(b.title);
            } else if (sortKey === 'status') {
                cmp = a.status.localeCompare(b.status);
            }
            return sortAsc ? cmp : -cmp;
        });

        return sorted;
    }, [submissions, activeFilter, query, sortKey, sortAsc]);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const toggleFilter = (filter: string) => {
        setActiveFilter((current) => (current === filter ? 'all' : filter));
    };

    const toggleSort = (key: SortKey) => {
        setSortKey((currentKey) => {
            if (currentKey === key) {
                setSortAsc((asc) => !asc);
                return currentKey;
            }
            setSortAsc(true);
            return key;
        });
    };

    const handleQuickApprove = (id: number) => {
        const target = submissions.find((s) => s.id === id);
        if (!target || target.status === 'Approved') return;
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Approved' } : s)));
        showToast(`Aprovado: "${target.title}"`);
    };

    const handleQuickReject = (id: number) => {
        const target = submissions.find((s) => s.id === id);
        if (!target || target.status === 'Rejected') return;
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Rejected' } : s)));
        showToast(`Rejeitado: "${target.title}"`);
        setPendingReject(null);
    };

    const handleCreateSubmission = () => {
        if (!newTitle.trim() || !newSubmitter.trim()) return;
        const nextId = Math.max(0, ...submissions.map((s) => s.id)) + 1;
        const dateStr = TODAY.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const due = new Date(TODAY);
        due.setDate(due.getDate() + 7);
        setSubmissions((prev) => [
            {
                id: nextId,
                title: newTitle.trim(),
                submittedBy: newSubmitter.trim(),
                date: dateStr,
                dueDate: due.toISOString().slice(0, 10),
                status: 'Under Review',
                type: newType,
            },
            ...prev,
        ]);
        showToast(`Nova submissão criada: "${newTitle.trim()}"`);
        setNewTitle('');
        setNewSubmitter('');
        setNewType('Design');
        setShowNewModal(false);
    };

    const sortLabel: Record<SortKey, string> = {
        date: 'Prazo',
        title: 'Documentos',
        status: 'Estado',
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 space-y-6 text-gray-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Aprovações e Revisões</h1>
                <button
                    onClick={() => setShowNewModal(true)}
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
                    label="Em revisão"
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
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
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

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Procurar por título ou autor..."
                                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 w-56
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                            <ArrowUpDown size={13} />
                            <select
                                value={sortKey}
                                onChange={(e) => toggleSort(e.target.value as SortKey)}
                                className="border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            >
                                <option value="date">Prazo</option>
                                <option value="title">Documentos</option>
                                <option value="status">Estado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div
                        role="status"
                        className="p-12 flex flex-col items-center text-center gap-2"
                    >
                        <Inbox className="text-gray-300" size={32} strokeWidth={1.5} />
                        <p className="text-sm text-gray-400">
                            {query
                                ? `Nenhum resultado para "${query}".`
                                : 'Sem submissões para este filtro.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table — sm and up */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('title')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Documentos
                                                {sortKey === 'title' && (
                                                    <ArrowUpDown size={12} />
                                                )}
                                            </button>
                                        </th>
                                        <th className="text-left p-4 font-medium text-gray-500">Tipo</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Submetido Por</th>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('date')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Prazo
                                                {sortKey === 'date' && <ArrowUpDown size={12} />}
                                            </button>
                                        </th>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('status')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Estado
                                                {sortKey === 'status' && (
                                                    <ArrowUpDown size={12} />
                                                )}
                                            </button>
                                        </th>
                                        <th className="text-right p-4 font-medium text-gray-500">Acções</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubmissions.map((item) => {
                                        const overdue = isOverdue(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-gray-900 max-w-xs">
                                                    <button
                                                        onClick={() => setDetailItem(item)}
                                                        className="truncate block max-w-xs text-left hover:underline underline-offset-2"
                                                    >
                                                        {item.title}
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <TypeBadge type={item.type} />
                                                </td>
                                                <td className="p-4 text-gray-600">{item.submittedBy}</td>
                                                <td className="p-4 text-gray-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {item.date}
                                                        {overdue && (
                                                            <span
                                                                title={`${daysOverdue(item)} dia(s) fora de prazo`}
                                                                className="inline-flex items-center gap-0.5 text-red-600"
                                                            >
                                                                <AlertTriangle size={12} strokeWidth={2.5} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="p-4">
                                                    {pendingReject === item.id ? (
                                                        <div className="flex justify-end">
                                                            <ConfirmInline
                                                                label={`Rejeitar?`}
                                                                onConfirm={() => handleQuickReject(item.id)}
                                                                onCancel={() => setPendingReject(null)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-1">
                                                            {item.status !== 'Approved' && (
                                                                <ActionButton
                                                                    onClick={() => handleQuickApprove(item.id)}
                                                                    icon={Check}
                                                                    label="Aprovar"
                                                                    tone="green"
                                                                    showLabel={false}
                                                                />
                                                            )}
                                                            {item.status !== 'Rejected' && (
                                                                <ActionButton
                                                                    onClick={() => setPendingReject(item.id)}
                                                                    icon={X}
                                                                    label="Rejeitar"
                                                                    tone="red"
                                                                    showLabel={false}
                                                                />
                                                            )}
                                                            <ActionButton
                                                                onClick={() => setDetailItem(item)}
                                                                icon={Eye}
                                                                label="Ver"
                                                                tone="blue"
                                                                showLabel={false}
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Cards — below sm */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {filteredSubmissions.map((item) => {
                                const overdue = isOverdue(item);
                                return (
                                    <div key={item.id} className="p-4 space-y-3">
                                        <button
                                            onClick={() => setDetailItem(item)}
                                            className="flex items-start gap-2 text-left w-full"
                                        >
                                            <FileText className="text-gray-400 mt-0.5 shrink-0" size={16} />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                                <div className="mt-1">
                                                    <TypeBadge type={item.type} />
                                                </div>
                                            </div>
                                        </button>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{item.submittedBy}</span>
                                            <span className="inline-flex items-center gap-1">
                                                {item.date}
                                                {overdue && (
                                                    <AlertTriangle
                                                        size={12}
                                                        strokeWidth={2.5}
                                                        className="text-red-600"
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <StatusBadge status={item.status} />
                                            {pendingReject === item.id ? (
                                                <ConfirmInline
                                                    label="Rejeitar?"
                                                    onConfirm={() => handleQuickReject(item.id)}
                                                    onCancel={() => setPendingReject(null)}
                                                />
                                            ) : (
                                                <div className="flex gap-1">
                                                    {item.status !== 'Approved' && (
                                                        <ActionButton
                                                            onClick={() => handleQuickApprove(item.id)}
                                                            icon={Check}
                                                            label="Aprovar"
                                                            tone="green"
                                                            showLabel={false}
                                                        />
                                                    )}
                                                    {item.status !== 'Rejected' && (
                                                        <ActionButton
                                                            onClick={() => setPendingReject(item.id)}
                                                            icon={X}
                                                            label="Rejeitar"
                                                            tone="red"
                                                            showLabel={false}
                                                        />
                                                    )}
                                                    <ActionButton
                                                        onClick={() => setDetailItem(item)}
                                                        icon={Eye}
                                                        label="Ver"
                                                        tone="blue"
                                                        showLabel={false}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Detail modal ("Ver") */}
            {detailItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setDetailItem(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{detailItem.title}</h3>
                            <button
                                onClick={() => setDetailItem(null)}
                                aria-label="Fechar"
                                className="text-gray-400 hover:text-gray-600 shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <TypeBadge type={detailItem.type} />
                            <StatusBadge status={detailItem.status} />
                            {isOverdue(detailItem) && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                    <AlertTriangle size={12} strokeWidth={2.5} />
                                    {daysOverdue(detailItem)} dia(s) fora de prazo
                                </span>
                            )}
                        </div>
                        <dl className="text-sm text-gray-600 space-y-1.5">
                            <div className="flex justify-between">
                                <dt className="text-gray-400">Submetido por</dt>
                                <dd className="font-medium text-gray-900">{detailItem.submittedBy}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">Data</dt>
                                <dd className="font-medium text-gray-900">{detailItem.date}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">Prazo</dt>
                                <dd className="font-medium text-gray-900">{detailItem.dueDate}</dd>
                            </div>
                        </dl>
                        <div className="flex justify-end gap-2 pt-2">
                            {detailItem.status !== 'Approved' && (
                                <ActionButton
                                    onClick={() => {
                                        handleQuickApprove(detailItem.id);
                                        setDetailItem(null);
                                    }}
                                    icon={Check}
                                    label="Aprovar"
                                    tone="green"
                                />
                            )}
                            {detailItem.status !== 'Rejected' && (
                                <ActionButton
                                    onClick={() => {
                                        setDetailItem(null);
                                        setPendingReject(detailItem.id);
                                    }}
                                    icon={X}
                                    label="Rejeitar"
                                    tone="red"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* New submission modal */}
            {showNewModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setShowNewModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">Nova Submissão</h3>
                            <button
                                onClick={() => setShowNewModal(false)}
                                aria-label="Fechar"
                                className="text-gray-400 hover:text-gray-600 shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Título do documento
                                </label>
                                <input
                                    autoFocus
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="ex: Plano Elétrico - Revisão 01"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Submetido por
                                </label>
                                <input
                                    value={newSubmitter}
                                    onChange={(e) => setNewSubmitter(e.target.value)}
                                    placeholder="Nome do autor"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value as SubmissionType)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                >
                                    <option value="Design">Design</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Client Approval">Client Approval</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateSubmission}
                                disabled={!newTitle.trim() || !newSubmitter.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Criar Submissão
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-2xl">
                    {toast}
                </div>
            )}
        </div>
    );
}