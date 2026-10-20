
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

type Props = {
  email: string;
};

export default function ChangePasswordForm({ email }: Props) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "A nova palavra-passe deve ter pelo menos 8 caracteres.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("As palavras-passe não coincidem.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "A nova palavra-passe deve ser diferente da actual.",
      );
      return;
    }

    setLoading(true);

    try {
      // Reconfirmar a identidade com a palavra-passe actual.
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

      if (signInError) {
        setErrorMessage(
          "A palavra-passe actual está incorrecta.",
        );
        return;
      }

      // Actualizar a palavra-passe do utilizador autenticado.
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        setErrorMessage(
          updateError.message ||
            "Não foi possível alterar a palavra-passe.",
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Palavra-passe alterada com sucesso.",
      );

      router.refresh();
    } catch {
      setErrorMessage(
        "Ocorreu um erro inesperado. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-3 pr-11 text-sm text-[#002950] outline-none transition placeholder:text-gray-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:bg-gray-100";

  function PasswordField({
    id,
    label,
    value,
    onChange,
    visible,
    toggleVisibility,
    placeholder,
    autoComplete,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    toggleVisibility: () => void;
    placeholder: string;
    autoComplete: string;
  }) {
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-[#002950]"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={id}
            name={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={loading}
            required
            className={inputClass}
          />

          <button
            type="button"
            onClick={toggleVisibility}
            disabled={loading}
            aria-label={
              visible
                ? `Ocultar ${label.toLowerCase()}`
                : `Mostrar ${label.toLowerCase()}`
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-[#002950] disabled:opacity-50"
          >
            {visible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002950]/5 text-[#002950]">
            <KeyRound size={23} />
          </div>

          <div>
            <h2 className="font-semibold text-[#002950]">
              Segurança da conta
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Conta autenticada: {email}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-5 sm:p-7"
      >
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />
            <p>{successMessage}</p>
          </div>
        )}

        <PasswordField
          id="currentPassword"
          label="Palavra-passe actual"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={showCurrent}
          toggleVisibility={() =>
            setShowCurrent((previous) => !previous)
          }
          placeholder="Introduza a palavra-passe actual"
          autoComplete="current-password"
        />

        <div className="border-t border-gray-100 pt-5">
          <PasswordField
            id="newPassword"
            label="Nova palavra-passe"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            toggleVisibility={() =>
              setShowNew((previous) => !previous)
            }
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
          />

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Utilize uma palavra-passe forte, difícil de adivinhar
            e que não utilize noutros serviços.
          </p>
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirmar nova palavra-passe"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirm}
          toggleVisibility={() =>
            setShowConfirm((previous) => !previous)
          }
          placeholder="Introduza novamente a nova palavra-passe"
          autoComplete="new-password"
        />

        <div className="flex items-start gap-3 rounded-lg bg-[#F7F7F5] p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-[#BD9655]"
          />

          <p className="text-xs leading-5 text-gray-600">
            A palavra-passe é actualizada através do Supabase
            Auth. Não é armazenada directamente na tabela
            profiles.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                A actualizar...
              </>
            ) : (
              <>
                <KeyRound size={17} />
                Alterar palavra-passe
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
