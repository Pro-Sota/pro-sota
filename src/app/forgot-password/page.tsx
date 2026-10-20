
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (error) {
      console.error("Password recovery error:", error);

      setError(
        process.env.NODE_ENV === "development"
          ? error.message
          : "Não foi possível enviar o email. Tente novamente mais tarde.",
      );
      return;
    }

    setSent(true);
  } catch (err) {
    console.error("Unexpected password recovery error:", err);

    setError("Ocorreu um erro inesperado. Tente novamente.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#002950]"
        >
          <ArrowLeft size={16} />
          Voltar ao início de sessão
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#002950]/5 text-[#002950]">
            {sent ? <CheckCircle2 size={24} /> : <KeyRound size={24} />}
          </div>

          <h1 className="text-2xl font-semibold text-[#002950]">
            {sent ? "Verifique o seu email" : "Esqueceu-se da palavra-passe?"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {sent
              ? "Se existir uma conta associada a este endereço, receberá um link para redefinir a palavra-passe."
              : "Introduza o endereço de email associado à sua conta. Enviaremos um link para criar uma nova palavra-passe."}
          </p>

          {!sent && (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#002950]"
                >
                  Endereço de email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nome@empresa.com"
                    className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#003b70] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    A enviar...
                  </>
                ) : (
                  "Enviar link de recuperação"
                )}
              </button>
            </form>
          )}

          {sent && (
            <button
              onClick={() => {
                setSent(false);
                setError("");
              }}
              className="mt-6 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-[#002950] hover:bg-gray-50"
            >
              Tentar outro email
            </button>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            PRO SOTA · Gestão de projectos
          </p>
        </div>
      </div>
    </main>
  );
}
