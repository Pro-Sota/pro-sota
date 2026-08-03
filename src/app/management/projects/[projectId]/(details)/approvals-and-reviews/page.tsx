'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
    Edit,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';
import Loader from '@/app/components/loader';

type SubmissionStatus = 'Aprovado' | 'Mudanças Solicitadas' | 'Em Revisão' | 'Rejeitado';
type SubmissionType = 'Design' | 'Técnico' | 'Aprovação Cliente';
type ToastType = 'success' | 'error' | 'info';

type Submission = {
    id: number;
    title: string;
    submittedBy: string;
    submittedDate: string; // ISO date
    dueDate: string; // ISO date
    status: SubmissionStatus;
    type: SubmissionType;
    description?: string;
};

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type UndoState = {
    action: 'delete' | 'status_change';
    submission: Submission;
    previousStatus?: SubmissionStatus;
    timestamp: number;
};

// Get today's date dynamically
const getToday = () => new Date();

const INITIAL_SUBMISSIONS: Submission[] = [
    {
        id: 1,
        title: 'Desenhos Arquitetónicos - Revisão 03',
        submittedBy: 'Carlos Mendes',
        submittedDate: '2026-07-10',
        dueDate: '2026-07-17',
        status: 'Em Revisão',
        type: 'Design',
        description: 'Conjunto completo de desenhos para aprovação inicial',
    },
    {
        id: 2,
        title: 'Pacote Estrutural - Revisão 02',
        submittedBy: 'Ana Silva',
        submittedDate: '2026-07-08',
        dueDate: '2026-07-15',
        status: 'Mudanças Solicitadas',
        type: 'Técnico',
        description: 'Cálculos estruturais e detalhes de reforço',
    },
    {
        id: 3,
        title: 'Seleção de Materiais Interiores',
        submittedBy: 'João Costa',
        submittedDate: '2026-07-05',
        dueDate: '2026-07-12',
        status: 'Aprovado',
        type: 'Aprovação Cliente',
        description: 'Paleta de cores e acabamentos finais',
    },
    {
        id: 4,
        title: 'Pacote Detalhe Revestimento Fachada — Elevação Norte Zona B',
        submittedBy: 'Mariana Lopes',
        submittedDate: '2026-07-02',
        dueDate: '2026-07-09',
        status: 'Em Revisão',
        type: 'Técnico',
        description: 'Especificações de revestimento e fixação',
    },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
    'Aprovado': 'bg-green-100 text-green-700',
    'Mudanças Solicitadas': 'bg-orange-100 text-orange-700',
    'Em Revisão': 'bg-blue-100 text-blue-700',
    'Rejeitado': 'bg-red-100 text-red-700',
};

const TYPE_STYLES: Record<SubmissionType, { badge: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }> = {
    'Design': { badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: PenTool },
    'Técnico': { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: Wrench },
    'Aprovação Cliente': { badge: 'bg-teal-50 text-teal-700 border-teal-200', icon: ClipboardCheck },
};

const STORAGE_KEY = 'approvals_submissions';
const UNDO_STACK_KEY = 'approvals_undo_stack';

function isOverdue(s: Submission) {
    if (s.status !== 'Em Revisão' && s.status !== 'Mudanças Solicitadas') return false;
    return new Date(s.dueDate).getTime() < getToday().getTime();
}

function daysOverdue(s: Submission) {
    const diff = getToday().getTime() - new Date(s.dueDate).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateString: string, locale = 'pt-PT'): string {
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
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
                    {active ? '● ativo' : 'filtro →'}
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
    tone: 'green' | 'red' | 'blue' | 'gray';
    showLabel?: boolean;
    disabled?: boolean;
};

function ActionButton({ onClick, icon: Icon, label, tone, showLabel = true, disabled = false }: ActionButtonProps) {
    const tones = {
        green: 'text-green-700 hover:bg-green-50 focus-visible:ring-green-500 disabled:text-green-400',
        red: 'text-red-700 hover:bg-red-50 focus-visible:ring-red-500 disabled:text-red-400',
        blue: 'text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500 disabled:text-blue-400',
        gray: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500 disabled:text-gray-400',
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${tones[tone]} ${disabled ? 'cursor-not-allowed' : ''}`}
        >
            <Icon size={15} strokeWidth={2.25} />
            {showLabel && <span>{label}</span>}
        </button>
    );
}

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

function ToastNotification({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-gray-900',
    };

    return (
        <div className={`${colors[toast.type]} text-white px-5 py-3 rounded-xl shadow-2xl text-sm flex items-center justify-between gap-3`}>
            <span>{toast.message}</span>
            <button
                onClick={onClose}
                className="text-white/70 hover:text-white"
                aria-label="Fechar notificação"
            >
                <X size={16} />
            </button>
        </div>
    );
}

type SortKey = 'date' | 'title' | 'status' | 'submittedDate';

export default function ApprovalsAndReviewsPage() {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<SubmissionType | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortAsc, setSortAsc] = useState(false);
    const [pendingReject, setPendingReject] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<number | null>(null);
    const [detailItem, setDetailItem] = useState<Submission | null>(null);
    const [editItem, setEditItem] = useState<Submission | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newType, setNewType] = useState<SubmissionType>('Design');
    const [newSubmitter, setNewSubmitter] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [undoStack, setUndoStack] = useState<UndoState[]>([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setSubmissions(JSON.parse(saved));
            }
            const savedUndo = localStorage.getItem(UNDO_STACK_KEY);
            if (savedUndo) {
                setUndoStack(JSON.parse(savedUndo));
            }
        } catch (e) {
            console.error('Failed to load from localStorage', e);
        }
    }, []);

    // Save to localStorage when submissions change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    }, [submissions]);

    // Save undo stack
    useEffect(() => {
        localStorage.setItem(UNDO_STACK_KEY, JSON.stringify(undoStack.slice(0, 10))); // Keep last 10
    }, [undoStack]);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);


    const counts = useMemo(
        () => ({
            pending: submissions.filter((s) => s.status === 'Em Revisão').length,
            approved: submissions.filter((s) => s.status === 'Aprovado').length,
            changesRequested: submissions.filter((s) => s.status === 'Mudanças Solicitadas').length,
            overdue: submissions.filter(isOverdue).length,
        }),
        [submissions]
    );

    const filteredSubmissions = useMemo(() => {
        let list = submissions;

        switch (activeFilter) {
            case 'pending':
                list = list.filter((s) => s.status === 'Em Revisão');
                break;
            case 'approved':
                list = list.filter((s) => s.status === 'Aprovado');
                break;
            case 'changesRequested':
                list = list.filter((s) => s.status === 'Mudanças Solicitadas');
                break;
            case 'overdue':
                list = list.filter(isOverdue);
                break;
            default:
                break;
        }

        if (typeFilter !== 'all') {
            list = list.filter((s) => s.type === typeFilter);
        }

        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.submittedBy.toLowerCase().includes(q) ||
                    (s.description?.toLowerCase().includes(q) ?? false)
            );
        }

        const sorted = [...list].sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'date') {
                cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else if (sortKey === 'submittedDate') {
                cmp = new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
            } else if (sortKey === 'title') {
                cmp = a.title.localeCompare(b.title);
            } else if (sortKey === 'status') {
                cmp = a.status.localeCompare(b.status);
            }
            return sortAsc ? cmp : -cmp;
        });

        return sorted;
    }, [submissions, activeFilter, query, typeFilter, sortKey, sortAsc]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
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
        if (!target || target.status === 'Aprovado') return;

        setUndoStack((prev) => [
            { action: 'status_change', submission: target, previousStatus: target.status, timestamp: Date.now() },
            ...prev,
        ]);

        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Aprovado' } : s)));
        showToast(`✓ Aprovado: "${target.title}"`, 'success');
    };

    const handleQuickReject = (id: number) => {
        const target = submissions.find((s) => s.id === id);
        if (!target || target.status === 'Rejeitado') return;

        setUndoStack((prev) => [
            { action: 'status_change', submission: target, previousStatus: target.status, timestamp: Date.now() },
            ...prev,
        ]);

        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Rejeitado' } : s)));
        showToast(`✗ Rejeitado: "${target.title}"`, 'error');
        setPendingReject(null);
    };

    const handleDelete = (id: number) => {
        const target = submissions.find((s) => s.id === id);
        if (!target) return;

        setUndoStack((prev) => [
            { action: 'delete', submission: target, timestamp: Date.now() },
            ...prev,
        ]);

        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        showToast(`Eliminado: "${target.title}"`, 'info');
        setPendingDelete(null);
        setDetailItem(null);
    };

    const handleUndo = () => {
        if (undoStack.length === 0) return;

        const [last, ...rest] = undoStack;

        if (last.action === 'delete') {
            setSubmissions((prev) => [last.submission, ...prev]);
            showToast(`Recuperado: "${last.submission.title}"`, 'success');
        } else if (last.action === 'status_change' && last.previousStatus) {
            setSubmissions((prev) =>
                prev.map((s) => (s.id === last.submission.id ? { ...s, status: last.previousStatus! } : s))
            );
            showToast(`Desfeito: "${last.submission.title}" → ${last.previousStatus}`, 'info');
        }

        setUndoStack(rest);
    };

    const handleChangeStatus = (id: number, newStatus: SubmissionStatus) => {
        const target = submissions.find((s) => s.id === id);
        if (!target) return;

        setUndoStack((prev) => [
            { action: 'status_change', submission: target, previousStatus: target.status, timestamp: Date.now() },
            ...prev,
        ]);

        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
        showToast(`Estado alterado: "${target.title}" → ${newStatus}`, 'info');
    };

    const handleBulkApprove = () => {
        if (selectedIds.size === 0) return;
        let approved = 0;
        setSubmissions((prev) =>
            prev.map((s) => {
                if (selectedIds.has(s.id) && s.status !== 'Aprovado') {
                    approved++;
                    return { ...s, status: 'Aprovado' };
                }
                return s;
            })
        );
        showToast(`${approved} submissão(ões) aprovada(s)`, 'success');
        setSelectedIds(new Set());
        setSelectMode(false);
    };

    const handleBulkReject = () => {
        if (selectedIds.size === 0) return;
        let rejected = 0;
        setSubmissions((prev) =>
            prev.map((s) => {
                if (selectedIds.has(s.id) && s.status !== 'Rejeitado') {
                    rejected++;
                    return { ...s, status: 'Rejeitado' };
                }
                return s;
            })
        );
        showToast(`${rejected} submissão(ões) rejeitada(s)`, 'error');
        setSelectedIds(new Set());
        setSelectMode(false);
    };

    const handleCreateOrUpdateSubmission = () => {
        if (!newTitle.trim() || !newSubmitter.trim() || !newDueDate) return;

        if (editItem) {
            // Update existing
            setSubmissions((prev) =>
                prev.map((s) =>
                    s.id === editItem.id
                        ? {
                            ...s,
                            title: newTitle.trim(),
                            submittedBy: newSubmitter.trim(),
                            description: newDescription.trim(),
                            type: newType,
                            dueDate: newDueDate,
                        }
                        : s
                )
            );
            showToast(`Atualizado: "${newTitle.trim()}"`, 'success');
        } else {
            // Create new
            const nextId = Math.max(0, ...submissions.map((s) => s.id)) + 1;
            const today = getToday().toISOString().slice(0, 10);
            setSubmissions((prev) => [
                {
                    id: nextId,
                    title: newTitle.trim(),
                    submittedBy: newSubmitter.trim(),
                    description: newDescription.trim(),
                    submittedDate: today,
                    dueDate: newDueDate,
                    status: 'Em Revisão',
                    type: newType,
                },
                ...prev,
            ]);
            showToast(`Nova submissão criada: "${newTitle.trim()}"`, 'success');
        }

        setNewTitle('');
        setNewSubmitter('');
        setNewDescription('');
        setNewType('Design');
        setNewDueDate('');
        setEditItem(null);
        setShowNewModal(false);
    };

    const openEditModal = (submission: Submission) => {
        setEditItem(submission);
        setNewTitle(submission.title);
        setNewSubmitter(submission.submittedBy);
        setNewDescription(submission.description || '');
        setNewType(submission.type);
        setNewDueDate(submission.dueDate);
        setShowNewModal(true);
        setDetailItem(null);
    };

    const closeModals = () => {
        setShowNewModal(false);
        setDetailItem(null);
        setEditItem(null);
        setNewTitle('');
        setNewSubmitter('');
        setNewDescription('');
        setNewType('Design');
        setNewDueDate('');
    };

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModals();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const sortLabel: Record<SortKey, string> = {
        date: 'Prazo',
        submittedDate: 'Data Submissão',
        title: 'Documentos',
        status: 'Estado',
    };

    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) return '↕';
        return sortAsc ? '↑' : '↓';
    };


    if (loading) return (<Loader />);

    return (
        <div className="min-h-screen p-4 sm:p-6 space-y-6 text-gray-700" role="main">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Aprovações e Revisões</h1>
                <div className="flex items-center gap-2">
                    {undoStack.length > 0 && (
                        <button
                            onClick={handleUndo}
                            title={`Desfazer: ${undoStack[0].action === 'delete' ? 'restauração' : 'mudança de estado'}`}
                            className="inline-flex items-center justify-center gap-1.5 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg
                                hover:bg-gray-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        >
                            <RotateCcw size={16} strokeWidth={2.5} />
                            <span className="hidden sm:inline text-sm">Desfazer</span>
                        </button>
                    )}
                    {selectMode && selectedIds.size > 0 && (
                        <>
                            <button
                                onClick={handleBulkApprove}
                                className="inline-flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg
                                    hover:bg-green-700 transition text-sm"
                            >
                                <Check size={16} />
                                Aprovar {selectedIds.size}
                            </button>
                            <button
                                onClick={handleBulkReject}
                                className="inline-flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg
                                    hover:bg-red-700 transition text-sm"
                            >
                                <X size={16} />
                                Rejeitar {selectedIds.size}
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setSelectMode(!selectMode)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition text-sm ${selectMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        <Check size={16} />
                        {selectMode ? 'Cancelar' : 'Selecionar'}
                    </button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg
                            hover:bg-slate-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Nova Submissão
                    </button>
                </div>
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
                    label="Mudanças"
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
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="font-semibold text-gray-900">Submissões ({filteredSubmissions.length})</h2>
                        {activeFilter !== 'all' && (
                            <button
                                onClick={() => setActiveFilter('all')}
                                className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:underline"
                            >
                                Limpar filtro
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Procurar..."
                                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 w-48
                                    focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as SubmissionType | 'all')}
                            className="border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                        >
                            <option value="all">Todos os tipos</option>
                            <option value="Design">Design</option>
                            <option value="Técnico">Técnico</option>
                            <option value="Aprovação Cliente">Aprovação Cliente</option>
                        </select>
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                            <ArrowUpDown size={13} />
                            <select
                                value={sortKey}
                                onChange={(e) => toggleSort(e.target.value as SortKey)}
                                className="border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            >
                                <option value="date">Prazo</option>
                                <option value="submittedDate">Data Submissão</option>
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
                                        {selectMode && (
                                            <th className="p-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.size === filteredSubmissions.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedIds(new Set(filteredSubmissions.map((s) => s.id)));
                                                        } else {
                                                            setSelectedIds(new Set());
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                            </th>
                                        )}
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('title')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Documentos
                                                <span className="text-xs text-gray-400">{getSortIcon('title')}</span>
                                            </button>
                                        </th>
                                        <th className="text-left p-4 font-medium text-gray-500">Tipo</th>
                                        <th className="text-left p-4 font-medium text-gray-500">Submetido Por</th>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('submittedDate')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Submetido
                                                <span className="text-xs text-gray-400">{getSortIcon('submittedDate')}</span>
                                            </button>
                                        </th>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('date')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Prazo
                                                <span className="text-xs text-gray-400">{getSortIcon('date')}</span>
                                            </button>
                                        </th>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            <button
                                                onClick={() => toggleSort('status')}
                                                className="inline-flex items-center gap-1 hover:text-gray-700"
                                            >
                                                Estado
                                                <span className="text-xs text-gray-400">{getSortIcon('status')}</span>
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
                                                {selectMode && (
                                                    <td className="p-4 w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(item.id)}
                                                            onChange={(e) => {
                                                                const newSet = new Set(selectedIds);
                                                                if (e.target.checked) {
                                                                    newSet.add(item.id);
                                                                } else {
                                                                    newSet.delete(item.id);
                                                                }
                                                                setSelectedIds(newSet);
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                    </td>
                                                )}
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
                                                <td className="p-4 text-gray-600 whitespace-nowrap text-xs">
                                                    {formatDate(item.submittedDate)}
                                                </td>
                                                <td className="p-4 text-gray-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {formatDate(item.dueDate)}
                                                        {overdue && (
                                                            <span
                                                                title={`${daysOverdue(item)} dia(s) fora de prazo`}
                                                                className="inline-flex items-center gap-0.5 text-red-600 text-xs font-medium"
                                                            >
                                                                <AlertTriangle size={12} strokeWidth={2.5} />
                                                                {daysOverdue(item)}d
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
                                                                label="Rejeitar?"
                                                                onConfirm={() => handleQuickReject(item.id)}
                                                                onCancel={() => setPendingReject(null)}
                                                            />
                                                        </div>
                                                    ) : pendingDelete === item.id ? (
                                                        <div className="flex justify-end">
                                                            <ConfirmInline
                                                                label="Eliminar?"
                                                                onConfirm={() => handleDelete(item.id)}
                                                                onCancel={() => setPendingDelete(null)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-1">
                                                            {item.status !== 'Aprovado' && (
                                                                <ActionButton
                                                                    onClick={() => handleQuickApprove(item.id)}
                                                                    icon={Check}
                                                                    label="Aprovar"
                                                                    tone="green"
                                                                    showLabel={false}
                                                                />
                                                            )}
                                                            {item.status !== 'Rejeitado' && (
                                                                <ActionButton
                                                                    onClick={() => setPendingReject(item.id)}
                                                                    icon={X}
                                                                    label="Rejeitar"
                                                                    tone="red"
                                                                    showLabel={false}
                                                                />
                                                            )}
                                                            <ActionButton
                                                                onClick={() => openEditModal(item)}
                                                                icon={Edit}
                                                                label="Editar"
                                                                tone="gray"
                                                                showLabel={false}
                                                            />
                                                            <ActionButton
                                                                onClick={() => setPendingDelete(item.id)}
                                                                icon={Trash2}
                                                                label="Eliminar"
                                                                tone="red"
                                                                showLabel={false}
                                                            />
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
                                        {selectMode && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(item.id)}
                                                    onChange={(e) => {
                                                        const newSet = new Set(selectedIds);
                                                        if (e.target.checked) {
                                                            newSet.add(item.id);
                                                        } else {
                                                            newSet.delete(item.id);
                                                        }
                                                        setSelectedIds(newSet);
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                            </div>
                                        )}
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
                                                {formatDate(item.dueDate)}
                                                {overdue && (
                                                    <span className="text-red-600 font-medium">
                                                        {daysOverdue(item)}d
                                                    </span>
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
                                            ) : pendingDelete === item.id ? (
                                                <ConfirmInline
                                                    label="Eliminar?"
                                                    onConfirm={() => handleDelete(item.id)}
                                                    onCancel={() => setPendingDelete(null)}
                                                />
                                            ) : (
                                                <div className="flex gap-1">
                                                    {item.status !== 'Aprovado' && (
                                                        <ActionButton
                                                            onClick={() => handleQuickApprove(item.id)}
                                                            icon={Check}
                                                            label="Aprovar"
                                                            tone="green"
                                                            showLabel={false}
                                                        />
                                                    )}
                                                    {item.status !== 'Rejeitado' && (
                                                        <ActionButton
                                                            onClick={() => setPendingReject(item.id)}
                                                            icon={X}
                                                            label="Rejeitar"
                                                            tone="red"
                                                            showLabel={false}
                                                        />
                                                    )}
                                                    <ActionButton
                                                        onClick={() => openEditModal(item)}
                                                        icon={Edit}
                                                        label="Editar"
                                                        tone="gray"
                                                        showLabel={false}
                                                    />
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
                    role="dialog"
                    aria-modal="true"
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
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                                    <AlertTriangle size={12} strokeWidth={2.5} />
                                    {daysOverdue(detailItem)} dia(s) fora de prazo
                                </span>
                            )}
                        </div>

                        {detailItem.description && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 font-medium mb-1">Descrição</p>
                                <p className="text-sm text-gray-700">{detailItem.description}</p>
                            </div>
                        )}

                        <dl className="text-sm text-gray-600 space-y-1.5 border-t pt-4">
                            <div className="flex justify-between">
                                <dt className="text-gray-400">Submetido por</dt>
                                <dd className="font-medium text-gray-900">{detailItem.submittedBy}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">Data de submissão</dt>
                                <dd className="font-medium text-gray-900">{formatDate(detailItem.submittedDate)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-400">Prazo</dt>
                                <dd className="font-medium text-gray-900">{formatDate(detailItem.dueDate)}</dd>
                            </div>
                        </dl>

                        <div className="flex justify-end gap-2 pt-2 border-t flex-wrap">
                            {detailItem.status !== 'Aprovado' && (
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
                            {detailItem.status !== 'Rejeitado' && (
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
                            <ActionButton
                                onClick={() => openEditModal(detailItem)}
                                icon={Edit}
                                label="Editar"
                                tone="gray"
                            />
                            <ActionButton
                                onClick={() => {
                                    setDetailItem(null);
                                    setPendingDelete(detailItem.id);
                                }}
                                icon={Trash2}
                                label="Eliminar"
                                tone="red"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* New/Edit submission modal */}
            {showNewModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => closeModals()}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editItem ? 'Editar Submissão' : 'Nova Submissão'}
                            </h3>
                            <button
                                onClick={() => closeModals()}
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
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Descrição (opcional)
                                </label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Detalhes adicionais..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 resize-none"
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
                                    <option value="Técnico">Técnico</option>
                                    <option value="Aprovação Cliente">Aprovação Cliente</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Prazo
                                </label>
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={(e) => setNewDueDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => closeModals()}
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateOrUpdateSubmission}
                                disabled={!newTitle.trim() || !newSubmitter.trim() || !newDueDate}
                                className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {editItem ? 'Guardar Alterações' : 'Criar Submissão'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notifications */}
            <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastNotification
                        key={toast.id}
                        toast={toast}
                        onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    />
                ))}
            </div>
        </div>
    );
}