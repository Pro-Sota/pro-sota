"use client";

import { Metadata } from 'next';

import {
    Briefcase,
    Users,
    Building2,
    ClipboardList,
    CalendarDays,
    Plus,
    UserPlus,
    Upload,
    CalendarPlus,
    Inbox,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import Loader from "../components/loader";
import { Database } from '../lib/supabase/models';

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-3">
                <Inbox className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="text-sm font-medium text-slate-900">{title}</h3>

            <p className="mt-1 max-w-xs text-sm text-slate-500">
                {description}
            </p>
        </div>
    );
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface props {
    allUsers: Profile[];
}
export default function Dashboard({ allUsers }: props) {

    const router = useRouter();

    // Replace these with your API data later
    const projects: any[] = [];
    const deadlines: any[] = [];
    const activities: any[] = [];
    const documents: any[] = [];
    const workload: any[] = [];

    const [teamSize, setTeamSize] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (allUsers) {
            setTeamSize(allUsers.length);
        }
        setLoading(false);
    }, [allUsers]);


    const stats = [
        {
            title: "Projetos Ativos",
            value: "0",
            change: "Sem dados",
            trend: "flat",
            icon: Briefcase,
        },
        {
            title: "Clientes",
            value: "0",
            change: "Sem dados",
            trend: "flat",
            icon: Building2,
        },
        {
            title: "Membros da Equipa",
            value: `${teamSize}`,
            change: "Sem dados",
            trend: "flat",
            icon: Users,
        },
        {
            title: "Tarefas Pendentes",
            value: "0",
            change: "Sem dados",
            trend: "flat",
            icon: ClipboardList,
        },
    ];

    const quickActions = [
        {
            label: "Novo Projeto",
            icon: Plus,
            href: "/management/projects/create-project",
        },
        {
            label: "Adicionar Cliente",
            icon: UserPlus,
            href: "/management/clients/create-client",
        },
        {
            label: "Carregar Documento",
            icon: Upload,
            href: "",
        },
        {
            label: "Agendar Reunião",
            icon: CalendarPlus,
            href: "",
        },
    ];

    if (loading) return (<Loader />);


    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Bem-vindo de volta. Aqui está uma visão geral do seu gabinete de
                        arquitetura.
                    </p>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => router.push(action.href)}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <action.icon size={16} className="text-slate-500" />
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-xl border border-slate-200 bg-white p-5"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                <item.icon size={18} className="text-slate-600" />
                            </div>

                            <h2 className="mt-5 text-sm text-slate-500">{item.title}</h2>

                            <p className="mt-1 text-2xl font-semibold text-slate-900">
                                {item.value}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">{item.change}</p>
                        </div>
                    ))}
                </div>

                {/* Main */}
                <div className="grid gap-4 xl:grid-cols-3">
                    {/* Projects */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
                        <h2 className="text-base font-semibold text-slate-900">
                            Projetos Ativos
                        </h2>

                        {projects.length === 0 ? (
                            <EmptyState
                                title="Sem projetos ativos"
                                description="Os projetos ativos aparecerão aqui quando forem criados."
                            />
                        ) : (
                            <div>{/* Render projects */}</div>
                        )}
                    </div>

                    {/* Deadlines */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="text-base font-semibold text-slate-900">
                            Próximos Prazos
                        </h2>

                        {deadlines.length === 0 ? (
                            <EmptyState
                                title="Sem prazos"
                                description="Não existem prazos agendados."
                            />
                        ) : (
                            <div className="mt-6 space-y-5">
                                {deadlines.map((item: any) => (
                                    <div key={item.title} className="flex items-start gap-3">
                                        <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {item.title}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                {item.project}
                                            </p>

                                            <p className="text-xs font-medium text-slate-400">
                                                {item.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Activity */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="mb-5 text-base font-semibold text-slate-900">
                            Atividade Recente
                        </h2>

                        {activities.length === 0 ? (
                            <EmptyState
                                title="Sem atividade recente"
                                description="A atividade da equipa aparecerá aqui."
                            />
                        ) : (
                            <div>{/* Render activity */}</div>
                        )}
                    </div>

                    {/* Workload */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="mb-5 text-base font-semibold text-slate-900">
                            Carga da Equipa
                        </h2>

                        {workload.length === 0 ? (
                            <EmptyState
                                title="Sem dados da equipa"
                                description="A distribuição da carga de trabalho aparecerá aqui."
                            />
                        ) : (
                            <div>{/* Render workload */}</div>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="mb-5 text-base font-semibold text-slate-900">
                            Documentos Recentes
                        </h2>

                        {documents.length === 0 ? (
                            <EmptyState
                                title="Sem documentos"
                                description="Os documentos recentes aparecerão aqui."
                            />
                        ) : (
                            <div>{/* Render documents */}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}