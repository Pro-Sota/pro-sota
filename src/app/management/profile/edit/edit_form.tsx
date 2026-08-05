"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import Loader from "@/app/components/loader";
import { Database } from "@/app/lib/supabase/models";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function EditForm({ profile }: { profile: Profile | null }) {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        email: profile.email ?? "",
        phone_number: profile.phone_number ?? "",
        department: profile.department ?? "",
      });
    }
    setLoading(false);
  }, [profile]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    // TODO:
    // await updateProfile(form)
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <Link
                href="/management/profile"
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={16} />
                Voltar ao perfil
              </Link>

              <h1 className="text-4xl font-serif">
                Editar Perfil
              </h1>

              <p className="mt-2 text-gray-500">
                Atualize as suas informações pessoais.
              </p>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-900 text-3xl font-serif font-semibold text-slate-200">
              {`${form.first_name[0] ?? ""}${form.last_name[0] ?? ""}`.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">

            <Input
              icon={<User size={18} />}
              label="Nome"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />

            <Input
              icon={<User size={18} />}
              label="Apelido"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />

            <Input
              icon={<Mail size={18} />}
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              icon={<Phone size={18} />}
              label="Telefone"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <Input
                icon={<Building2 size={18} />}
                label="Departamento"
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="mt-10 flex justify-end gap-4">

            <Link
              href="/profile"
              className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Save size={18} />
              Guardar Alterações
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

type InputProps = {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
};

function Input({
  icon,
  label,
  name,
  value,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-gray-300 bg-white px-4 focus-within:border-gray-900">
        <span className="mr-3 text-gray-400">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>
    </div>
  );
}