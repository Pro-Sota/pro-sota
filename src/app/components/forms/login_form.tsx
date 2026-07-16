"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={signIn}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md space-y-4"
      >
        <h1 className="text-center text-2xl font-bold">
          Sign in
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
        />

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}