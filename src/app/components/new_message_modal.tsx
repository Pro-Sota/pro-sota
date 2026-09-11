"use client";

import {
  Search,
  X,
  MessageCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createConversationAction,
  getMessageRecipientsAction,
} from "@/app/actions/message";

import type { Recipient } from "@/services/messages";

interface NewConversationModalProps {
  open: boolean;
  onClose: () => void;
  onStartConversation?: (conversationId: string) => void;
}

export default function NewConversationModal({
  open,
  onClose,
  onStartConversation,
}: NewConversationModalProps) {
  const router = useRouter();

  const [users, setUsers] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    null,
  );

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [startingConversation, setStartingConversation] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || users.length > 0) {
      return;
    }

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);

        const recipients = await getMessageRecipientsAction();

        setUsers(recipients);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Falha ao carregar usuários",
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, [open, users.length]);

  const searchTerm = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) {
      return true;
    }

    const name = user.name?.toLowerCase() || "";
    const department = user.department?.toLowerCase() || "";

    return (
      name.includes(searchTerm) ||
      department.includes(searchTerm)
    );
  });

  const handleClose = () => {
    if (startingConversation) {
      return;
    }

    setSearchQuery("");
    setSelectedUserId(null);
    setError(null);

    onClose();
  };

  const handleStartConversation = async () => {
    if (!selectedUserId || startingConversation) {
      return;
    }

    try {
      setStartingConversation(true);
      setError(null);

      const conversationId =
        await createConversationAction(selectedUserId);

      if (onStartConversation) {
        onStartConversation(conversationId);
      }

      router.push(
        `/management/messages/${conversationId}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao iniciar conversa",
      );

      setStartingConversation(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Nova conversa
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Escolha uma pessoa para iniciar uma conversa.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={startingConversation}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Pesquisar pessoa..."
              autoFocus
              disabled={startingConversation}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-1 focus:ring-[#BD9655]/30 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Loader2
                size={22}
                className="animate-spin text-slate-500"
              />

              <p className="mt-3 text-sm text-slate-500">
                Carregando usuários...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <MessageCircle
                size={28}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <MessageCircle
                size={28}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                {searchTerm
                  ? "Nenhum usuário encontrado."
                  : "Nenhum usuário disponível."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected =
                selectedUserId === user.profileId;

              const initials = user.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase();

              return (
                <button
                  key={user.profileId}
                  type="button"
                  disabled={startingConversation}
                  onClick={() =>
                    setSelectedUserId(user.profileId)
                  }
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-6 py-3.5 text-left transition ${
                    isSelected
                      ? "bg-slate-50"
                      : "hover:bg-slate-50"
                  } disabled:cursor-not-allowed`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold ${
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {initials}
                    </div>

                    {user.isOnline ? (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    ) : null}
                  </div>

                  {/* User */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.department ||
                        "Sem departamento"}
                    </p>
                  </div>

                  {/* Selected */}
                  {isSelected ? (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900">
                      <Check
                        size={14}
                        className="text-white"
                      />
                    </div>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={startingConversation}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleStartConversation}
            disabled={
              !selectedUserId || startingConversation
            }
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {startingConversation ? (
              <span className="flex items-center gap-2">
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                A iniciar...
              </span>
            ) : (
              "Iniciar conversa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}