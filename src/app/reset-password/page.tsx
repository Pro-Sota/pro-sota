"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import {
  KeyRound,
  LoaderCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checking, setChecking] = useState(true);
  const [validRecovery, setValidRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let recoveryDetected = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryDetected = true;

        if (active) {
          setValidRecovery(true);
          setError("");
          setChecking(false);
        }
      }
    });

    async function verifyRecoveryLink() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const recoveryError =
          url.searchParams.get("error_description") ||
          url.searchParams.get("error");

        if (recoveryError) {
          throw new Error(
            "O link de recuperação é inválido ou expirou. Solicite um novo link.",
          );
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw new Error(
              "O link de recuperação é inválido ou expirou. Solicite um novo link.",
            );
          }

          url.searchParams.delete("code");

          window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`,
          );

          // Supabase has exchanged the one-time recovery code.
          recoveryDetected = true;

          if (active) {
            setValidRecovery(true);
            setError("");
          }

          return;
        }

        // Support links that return recovery tokens in the URL hash.
        const hashParams = new URLSearchParams(
          url.hash.replace(/^#/, ""),
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const tokenType = hashParams.get("type");

        if (
          accessToken &&
          refreshToken &&
          tokenType === "recovery"
        ) {
          const { error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) {
            throw new Error(
              "O link de recuperação é inválido ou expirou. Solicite um novo link.",
            );
          }

          window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}`,
          );

          recoveryDetected = true;

          if (active) {
            setValidRecovery(true);
            setError("");
          }

          return;
        }

        // Allow the recovery event to establish recovery state.
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!recoveryDetected) {
          throw new Error(
            "Não foi possível validar o link de recuperação. Solicite um novo link.",
          );
        }
      } catch (err) {
        if (active) {
          setValidRecovery(false);
          setError(
            err instanceof Error
              ? err.message
              : "Ocorreu um erro ao validar o link.",
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void verifyRecoveryLink();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(
          updateError.message ||
            "Não foi possível alterar a palavra-passe.",
        );
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F5] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#002950]/5 text-[#002950]">
          {success ? (
            <CheckCircle2 size={24} />
          ) : (
            <KeyRound size={24} />
          )}
        </div>

        <h1 className="text-2xl font-semibold text-[#002950]">
          {success
            ? "Palavra-passe actualizada"
            : "Definir nova palavra-passe"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {success
            ? "A sua palavra-passe foi alterada com sucesso. Pode agora iniciar sessão."
            : "Introduza uma nova palavra-passe para recuperar o acesso à sua conta PRO SOTA."}
        </p>

        {checking ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <LoaderCircle size={18} className="animate-spin" />
            A validar o link de recuperação...
          </div>
        ) : success ? (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-7 w-full rounded-lg bg-[#002950] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#003b70]"
          >
            Ir para o início de sessão
          </button>
        ) : validRecovery ? (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#002950]"
              >
                Nova palavra-passe
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  placeholder="Mínimo de 8 caracteres"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 pr-11 text-sm outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Ocultar palavra-passe"
                      : "Mostrar palavra-passe"
                  }
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-[#002950]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#002950]"
              >
                Confirmar palavra-passe
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  disabled={loading}
                  placeholder="Repita a nova palavra-passe"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 pr-11 text-sm outline-none transition focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={
                    showConfirm
                      ? "Ocultar confirmação"
                      : "Mostrar confirmação"
                  }
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-[#002950]"
                >
                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  A actualizar...
                </>
              ) : (
                "Guardar nova palavra-passe"
              )}
            </button>
          </form>
        ) : (
          <div className="mt-7">
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>
                {error ||
                  "Não foi possível validar o link de recuperação."}
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="mt-5 block w-full rounded-lg bg-[#002950] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#003b70]"
            >
              Solicitar novo link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}