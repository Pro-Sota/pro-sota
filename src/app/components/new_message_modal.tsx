"use client";
import {
    Search,
    X,
    MessageCircle,
    Loader2,
    Check,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { Database } from "../lib/supabase/models";
import { createClient } from "../lib/supabase/client";
import {
    createConversationAction,
} from "@/app/actions/message"

interface NewConversationModalProps {
    open: boolean;
    onClose: () => void;
    onStartConversation?: (userId: string) => void;
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function NewConversationModal({
    open,
    onClose,
    onStartConversation,
}: NewConversationModalProps) {
    const [users, setUsers] = useState<Profile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("profiles")
                .select("*");

            if (error) throw error;

            setUsers(data || []);
            setSearchResults(data || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Falha ao carregar usuários"
            );
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        if (open) loadUsers();
    }, [open, loadUsers]);

    const searchUsers = useCallback(
        (query: string) => {
            const term = query.toLowerCase().trim();

            if (!term) {
                setSearchResults(users);
                setError(null);
                return;
            }

            const filtered = users.filter((user) => {
                const fullName =
                    `${user.first_name} ${user.last_name}`.toLowerCase();

                const department =
                    user.department?.toLowerCase() || "";

                return (
                    fullName.includes(term) ||
                    department.includes(term)
                );
            });

            setSearchResults(filtered);
            setError(
                filtered.length === 0
                    ? "Nenhum usuário encontrado"
                    : null
            );
        },
        [users]
    );

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const query = e.target.value;

            setSearchQuery(query);

            const timeout = setTimeout(() => {
                searchUsers(query);
            }, 300);

            return () => clearTimeout(timeout);
        },
        [searchUsers]
    );

    const handleStartConversation = async () => {
        if (!selectedUserId) return;

        const conversationId = await createConversationAction(selectedUserId);

        onStartConversation?.(conversationId);
        handleClose();
    };

    const handleClose = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSelectedUserId(null);
        setError(null);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-8 py-8">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-400 rounded-full blur-3xl" />
                    </div>

                    <div className="relative flex justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Nova Conversa
                            </h2>

                            <p className="mt-2 text-slate-300 text-sm">
                                Procure por alguém para iniciar uma conversa direta
                            </p>
                        </div>

                        <button
                            onClick={handleClose}
                            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-800 transition"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                </div>


                {/* Search */}
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">

                    <div className="relative group">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900"
                        />

                        <input
                            placeholder="Buscar usuários..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            autoFocus
                            className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                    </div>

                </div>


                {/* Results */}
                <div className="max-h-96 overflow-y-auto">

                    {loading && (
                        <div className="flex justify-center py-16">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2
                                    size={24}
                                    className="animate-spin text-slate-900"
                                />

                                <p className="text-sm text-slate-500">
                                    Carregando usuários...
                                </p>
                            </div>
                        </div>
                    )}


                    {error && !loading && (
                        <div className="flex justify-center py-16">
                            <div className="text-center">
                                <MessageCircle
                                    size={32}
                                    className="mx-auto mb-2 text-slate-300"
                                />

                                <p className="text-sm text-slate-500">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}


                    {!loading &&
                        !error &&
                        searchResults.map((user) => (
                            <button
                                key={user.profile_id}
                                onClick={() =>
                                    setSelectedUserId(user.profile_id)
                                }
                                className={`w-full px-8 py-4 text-left border-b border-slate-100 transition ${selectedUserId === user.profile_id
                                    ? "bg-slate-100"
                                    : "hover:bg-slate-50"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div
                                            className={`h-14 w-14 flex items-center justify-center rounded-full text-white font-semibold ${selectedUserId === user.profile_id
                                                ? "bg-gradient-to-br from-slate-700 to-slate-900 ring-2 ring-slate-300"
                                                : "bg-gradient-to-br from-slate-400 to-slate-500"
                                                }`}
                                        >
                                            {user.first_name?.[0]}
                                            {user.last_name?.[0]}
                                        </div>

                                        {user.status === "Active" && (
                                            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                                        )}

                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">
                                            {user.first_name} {user.last_name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {user.department || "Sem departamento"}
                                        </p>
                                    </div>
                                    {selectedUserId === user.profile_id && (
                                        <div className="rounded-full bg-slate-900 p-1">
                                            <Check
                                                size={16}
                                                className="text-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                </div>


                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-8 py-5">

                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium text-sm hover:bg-slate-100"
                    >
                        Cancelar
                    </button>


                    <button
                        onClick={handleStartConversation}
                        disabled={!selectedUserId}
                        className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Iniciar Conversa
                    </button>

                </div>

            </div>
        </div>
    );
}