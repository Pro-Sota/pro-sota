"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

import Image from "next/image";

export default function LoginForm() {
  const supabase = useMemo(() => createClient(), []); const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (loading) return;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/management");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex justify-center mb-12">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={150}
              height={80}
              priority
              quality={100}
            />
          </div>
          <div className="mb-8 text-start">
            <h1 className="text-xl font-semibold text-slate-900">
              Login
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Insere o teu email e palavra-passe para continuar
            </p>
          </div>

          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "A fazer o login…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>)
};