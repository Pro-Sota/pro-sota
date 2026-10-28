
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Save,
  ArrowLeft,
  LoaderCircle,
  CalendarDays,
  Globe,
  BriefcaseBusiness,
  FileText,
  Camera,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/components/toast/use_toast";
import { createClient } from "@/app/lib/supabase/client";
import type { Database } from "@/app/lib/supabase/models";
import { uploadProfilePicture } from "@/services/user_profile";
import { updateProfileAction } from "@/actions/user_profile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type ProfileForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department: string;
  job_title: string;
  dob: string;
  nationality: string;
  bio: string;
  role_id: string;
  status: string;
};

const INITIAL_FORM: ProfileForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  department: "",
  job_title: "",
  dob: "",
  nationality: "",
  bio: "",
  role_id: "",
  status: "Pending",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const BUCKET = "profile-pictures";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type EditFormProps = {
  profile: Profile | null;
  isAdmin: boolean;
  isOwnProfile: boolean;
};

export default function EditForm({
  profile,
  isAdmin,
  isOwnProfile,
}: EditFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>(INITIAL_FORM);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  // Keep the remaining handlers and JSX below.
useEffect(() => {
  if (!profile) return;

  setForm({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    email: profile.email ?? "",
    phone_number: profile.phone_number ?? "",
    department: profile.department ?? "",
    job_title: profile.job_title ?? "",
    dob: profile.dob ?? "",
    nationality: profile.nationality ?? "",
    bio: profile.bio ?? "",
    role_id: profile.role_id != null ? String(profile.role_id) : "",
    status: profile.status ?? "Pending",
  });

  setProfilePicture(profile.profile_picture ?? null);
  setSelectedPicture(null);
}, [profile]);

  useEffect(() => {
    if (!selectedPicture) {
      setPicturePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPicture);
    setPicturePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPicture]);

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePictureChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Escolha uma imagem JPG, PNG ou WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("A imagem não pode ultrapassar 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedPicture(file);
  }

  function removeSelectedPicture() {
    setSelectedPicture(null);
    setPicturePreview(null);
  }


async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!profile || saving) return;

  if (!form.first_name.trim() || !form.last_name.trim()) {
    toast.error("Preencha o nome e o apelido.");
    return;
  }

  const parsedRoleId =
    form.role_id.trim() === "" ? null : Number(form.role_id);

  if (
    isAdmin &&
    parsedRoleId !== null &&
    (!Number.isSafeInteger(parsedRoleId) || parsedRoleId < 1)
  ) {
    toast.error("Introduza um ID de função válido.");
    return;
  }

  setSaving(true);

  try {
    let pictureUrl = profilePicture;

    if (selectedPicture) {
      const uploaded = await uploadProfilePicture(
        selectedPicture,
        profile.profile_id
      );

      pictureUrl = uploaded.url;
    }

    const result = await updateProfileAction({
      profile_id: profile.profile_id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      dob: form.dob,
      nationality: form.nationality.trim(),
      job_title: form.job_title.trim(),
      bio: form.bio.trim(),
      profile_picture: pictureUrl,

      ...(isAdmin
        ? {
            department: form.department.trim(),
            role_id: parsedRoleId,
            status: form.status as
              | "Active"
              | "Inactive"
              | "Pending"
              | "Suspended",
          }
        : {}),
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    toast.success("Perfil atualizado com sucesso.");

    router.refresh();
    router.push(
      isAdmin && !isOwnProfile
        ? "/management/team"
        : "/management/profile"
    );
  } catch (error) {
    console.error("Erro ao guardar perfil:", error);

    toast.error(
      error instanceof Error
        ? error.message
        : "Não foi possível guardar as alterações."
    );
  } finally {
    setSaving(false);
  }
}

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] p-6 md:p-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#002950]">
            Perfil não encontrado
          </h1>
          <Link
            href="/management/profile"
            className="mt-6 inline-flex items-center gap-2 text-sm text-[#002950]"
          >
            <ArrowLeft size={16} />
            Voltar ao perfil
          </Link>
        </div>
      </div>
    );
  }

  const displayedPicture =
    picturePreview ?? profilePicture;

  return (
    <div className="min-h-screen bg-[#F7F7F5] p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href={
                  isAdmin
                    ? "/management/team"
                    : "/management/profile"
                }
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#002950]"
              >
                <ArrowLeft size={16} />
                Voltar
              </Link>

              <h1 className="text-4xl font-sans text-[#002950]">
                Editar Perfil
              </h1>

              <p className="mt-2 text-gray-500">
                Atualize as informações pessoais e profissionais.
              </p>

              {isAdmin && (
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#002950]/5 px-3 py-1.5 text-xs font-medium text-[#002950]">
                  <ShieldCheck size={14} />
                  Edição de administrador
                </span>
              )}
            </div>

            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center self-start overflow-hidden rounded-2xl bg-[#002950] text-3xl font-semibold text-white md:self-auto">
              {displayedPicture ? (
                <img
                  src={displayedPicture}
                  alt="Fotografia de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                `${form.first_name[0] ?? ""}${form.last_name[0] ?? ""}`
                  .toUpperCase() || <User size={32} />
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >
          {/* Profile picture */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-[#002950]">
              Fotografia de perfil
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Escolha uma imagem guardada no seu computador.
            </p>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {displayedPicture ? (
                  <img
                    src={displayedPicture}
                    alt="Pré-visualização da fotografia"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
              </div>

              <div className="space-y-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  <Camera size={18} />
                  Escolher fotografia
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePictureChange}
                    className="sr-only"
                  />
                </label>

                {selectedPicture && (
                  <button
                    type="button"
                    onClick={removeSelectedPicture}
                    className="ml-3 inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <X size={15} />
                    Cancelar seleção
                  </button>
                )}

                <p className="text-xs text-gray-500">
                  JPG, PNG ou WebP. Tamanho máximo: 5 MB.
                  A imagem será enviada ao guardar as alterações.
                </p>

                {selectedPicture && (
                  <p className="text-sm text-[#002950]">
                    Ficheiro: {selectedPicture.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#002950]">
              Informações pessoais
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Os seus dados de identificação e contacto.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              icon={<User size={18} />}
              label="Nome"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />

            <Input
              icon={<User size={18} />}
              label="Apelido"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
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
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
            />

            <Input
              icon={<CalendarDays size={18} />}
              label="Data de nascimento"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />

            <Input
              icon={<Globe size={18} />}
              label="Nacionalidade"
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              placeholder="Ex.: Angolana"
            />
          </div>

          {/* Professional information */}
          <div className="mb-6 mt-10">
            <h2 className="text-lg font-semibold text-[#002950]">
              Informações profissionais
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Os dados profissionais na PRO SOTA.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              icon={<BriefcaseBusiness size={18} />}
              label="Cargo"
              name="job_title"
              value={form.job_title}
              onChange={handleChange}
              placeholder="Ex.: Arquitecto"
            />

            <Input
              icon={<Building2 size={18} />}
              label="Departamento"
              name="department"
              value={form.department}
              onChange={handleChange}
              disabled={!isAdmin}
            />

            {isAdmin && (
              <>
                <Input
                  icon={<ShieldCheck size={18} />}
                  label="ID da função (role_id)"
                  name="role_id"
                  type="number"
                  value={form.role_id}
                  onChange={handleChange}
                  placeholder="ID existente na tabela roles"
                />

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Estado da conta
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#BD9655]"
                  >
                    <option value="Active">Activo</option>
                    <option value="Inactive">Inactivo</option>
                    <option value="Pending">Pendente</option>
                    <option value="Suspended">Suspenso</option>
                  </select>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Biografia
              </label>

              <div className="rounded-xl border border-gray-300 px-4 py-3 transition focus-within:border-[#BD9655]">
                <div className="mb-2 flex items-center gap-3 text-gray-400">
                  <FileText size={18} />
                  <span className="text-sm">Sobre si</span>
                </div>

                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  maxLength={1000}
                  placeholder="Escreva uma breve apresentação sobre si, a sua experiência e as suas competências..."
                  className="w-full resize-y bg-transparent text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400"
                />

                <div className="mt-2 text-right text-xs text-gray-400">
                  {form.bio.length}/1000 caracteres
                </div>
              </div>
            </div>
          </div>

          {!isAdmin && (
            <p className="mt-5 text-xs text-gray-500">
              O departamento, a função de acesso e o estado da conta
              são geridos pela administração.
            </p>
          )}

          {/* Actions */}
          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Link
              href={
                isAdmin
                  ? "/management/team"
                  : "/management/profile"
              }
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#002950] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type InputProps = {
  icon: ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

function Input({
  icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div
        className={`flex items-center rounded-xl border border-gray-300 px-4 transition focus-within:border-[#BD9655] ${
          disabled ? "bg-gray-50" : "bg-white"
        }`}
      >
        <span className="mr-3 shrink-0 text-gray-400">
          {icon}
        </span>

        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-500"
        />
      </div>
    </div>
  );
}
