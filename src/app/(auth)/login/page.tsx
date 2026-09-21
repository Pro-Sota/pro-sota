"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "O email ou a palavra-passe estão incorretos.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "O teu email ainda não foi confirmado.";
  }

  if (normalizedMessage.includes("too many requests")) {
    return "Demasiadas tentativas. Tenta novamente mais tarde.";
  }

  if (normalizedMessage.includes("network")) {
    return "Não foi possível estabelecer ligação. Verifica a tua internet.";
  }

  return "Não foi possível iniciar sessão. Tenta novamente.";
}

export default function LoginForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/management");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? getAuthErrorMessage(err.message)
          : "Ocorreu um erro inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-[#F7F7F5]">
      {/* Brand Panel */}
      <section className="relative hidden overflow-hidden bg-[#002950] lg:flex lg:w-[48%] xl:w-[52%]">
        <Image
          src="/images/login-architecture.jpg"
          alt="Projecto de arquitectura"
          fill
          priority
          sizes="52vw"
          className="object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#001A33] via-[#002950]/70 to-[#002950]/20" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Pro-Sota"
              width={155}
              height={80}
              priority
              className="brightness-0 invert"
            />
          </div>

          {/* Brand Message */}
          <div className="max-w-lg">
            <div className="mb-6 h-1 w-14 bg-[#BD9655]" />

            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              Onde a visão se transforma em arquitectura e engenharia.
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
              Conectamos pessoas, projectos e processos para dar vida a grandes
              ideias através da arquitectura e engenharia.
            </p>

            <div className="mt-10 flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck size={18} className="text-[#BD9655]" />
              Ambiente profissional e seguro
            </div>
          </div>

          <p className="text-xs tracking-wide text-slate-400">
            © {new Date().getFullYear()} Pro-Sota. Todos os direitos reservados.
          </p>
        </div>
      </section>

      {/* Login Panel */}
      <section className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[52%] xl:w-[48%]">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="mb-12 flex justify-center lg:hidden">
            <Image
              src="/images/logo.png"
              alt="Pro-Sota"
              width={150}
              height={80}
              priority
            />
          </div>

          {/* Heading */}
          <div className="mb-9">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#BD9655]">
              Área reservada
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#002950]">
              Bem-vindo de volta.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Acede ao teu espaço de trabalho e mantém-te ligado à equipa
              Pro-Sota.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,41,80,0.04)] sm:p-8">
            <form onSubmit={signIn} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email profissional
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Palavra-passe
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#002950] transition hover:text-[#BD9655]"
                  >
                    Esqueceste a palavra-passe?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Introduz a tua palavra-passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 accent-[#002950] focus:ring-[#BD9655]"
                />

                <span className="text-xs text-slate-500">
                  Lembrar-me neste dispositivo
                </span>
              </label>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl 
                bg-[#BD9655] py-3.5 text-sm font-semibold text-[#002950] transition hover:bg-[#A98246] 
                focus:outline-none focus:ring-4 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed
                 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                    A iniciar sessão...
                  </>
                ) : (
                  <>
                    Entrar na plataforma
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Precisas de ajuda para aceder à tua conta?{" "}
            <Link
              href="/contact"
              className="font-medium text-[#002950] hover:text-[#BD9655]"
            >
              Contacta o suporte
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
