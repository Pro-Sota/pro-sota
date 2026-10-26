"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const MAX_IMAGE_BYTES = 3_000_000;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const REQUEST_TIMEOUT_MS = 20_000;
const MESSAGE_MAX = 4000;

const SERVICES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização e consultoria",
  "Outro",
];

const URGENCY = ["Imediata", "Até 1 mês", "1 a 3 meses"];

const CONTACT_LINKS = [
  { href: "tel:+244947803610", label: "+244 947 803 610" },
  { href: "tel:+244947804186", label: "+244 947 804 186" },
  { href: "mailto:geral@prosota.ao", label: "geral@prosota.ao" },
];

type Status = { type: "idle" | "success" | "error"; text: string };

const IDLE: Status = { type: "idle", text: "" };

/* Tailwind class groups (the gold colours still come from your CSS variables) */
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-white/80";

const fieldClass =
  "w-full rounded-md border border-white/15 bg-white/5 px-3.5 py-2.5 text-base text-white " +
  "placeholder:text-white/40 transition-colors " +
  "focus:border-[var(--gold-light)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-light)]/40 " +
  "disabled:opacity-60";

const statusClass: Record<Status["type"], string> = {
  idle: "text-transparent",
  success: "text-[var(--gold-light)]",
  error: "text-red-300",
};

function validateImage(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) {
    return "A imagem deve ter até 3 MB.";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Seleccione uma imagem PNG, JPEG ou WebP.";
  }

  return null;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Não foi possível ler a imagem."));
      }
    };

    reader.onerror = () =>
      reject(new Error("Não foi possível ler a imagem."));

    reader.readAsDataURL(file);
  });
}

export default function Contact() {
  const [status, setStatus] = useState<Status>(IDLE);
  const [busy, setBusy] = useState(false);
  const [imageName, setImageName] = useState("");
  const [messageLength, setMessageLength] = useState(0);

  const imageInput = useRef<HTMLInputElement>(null);

  function clearImage() {
    if (imageInput.current) imageInput.current.value = "";
    setImageName("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setStatus(IDLE);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("image");

    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (key !== "image" && typeof value === "string") {
        data[key] = value.trim();
      }
    });

    // Honeypot: real people never fill this field. Pretend success for bots.
    if (data.website) {
      setStatus({
        type: "success",
        text: "Pedido recebido. Entraremos em contacto consigo em breve.",
      });
      form.reset();
      clearImage();
      setBusy(false);
      return;
    }
    delete data.website;

    if (file instanceof File && file.size > 0) {
      const imageError = validateImage(file);

      if (imageError) {
        setStatus({ type: "error", text: imageError });
        setBusy(false);
        return;
      }

      try {
        data.image = await readAsDataURL(file);
        data.imageName = file.name;
      } catch (error) {
        setStatus({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Não foi possível processar a imagem.",
        });
        setBusy(false);
        return;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      // The body may not be valid JSON (e.g. a gateway error page).
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || "Não foi possível enviar o pedido.",
        );
      }

      setStatus({
        type: "success",
        text: "Pedido recebido. Entraremos em contacto consigo em breve.",
      });

      form.reset();
      clearImage();
      setMessageLength(0);
    } catch (error) {
      const timedOut =
        error instanceof DOMException && error.name === "AbortError";

      setStatus({
        type: "error",
        text: timedOut
          ? "O envio demorou demasiado. Verifique a ligação e tente novamente."
          : error instanceof Error
            ? error.message
            : "Não foi possível enviar. Tente novamente.",
      });
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImageName("");
      return;
    }

    const imageError = validateImage(file);

    if (imageError) {
      setStatus({ type: "error", text: imageError });
      clearImage();
      return;
    }

    setStatus(IDLE);
    setImageName(file.name);
  }

  return (
    <section
      id="contacto"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-28"
    >
      {/* Decorative grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <p className="mb-4 text-sm font-semibold tracking-wide text-[var(--gold-light)]">
          Vamos conversar
        </p>

        <h2
          id="contact-title"
          className="max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-5xl"
        >
          Prontos para construir{" "}
          <em className="italic text-[var(--gold-light)]">o futuro</em>{" "}
          consigo.
        </h2>

        <div className="mt-10 md:mt-14">
          <form
            onSubmit={submit}
            aria-busy={busy}
            className="relative flex w-full max-w-3xl flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm md:p-8"
          >
            <h3 className="text-xl font-semibold">Peça um orçamento</h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Nome *
                <input
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className={fieldClass}
                />
              </label>

              <label className={labelClass}>
                Email (opcional)
                <input
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                  inputMode="email"
                  className={fieldClass}
                />
              </label>

              <label className={labelClass}>
                Telefone *
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={50}
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[0-9+()\s\-]{7,}"
                  title="Introduza um número de telefone válido, por exemplo +244 900 000 000."
                  className={fieldClass}
                />
              </label>

              <label className={labelClass}>
                Tipo de serviço *
                <select
                  name="service"
                  required
                  defaultValue=""
                  className={`${fieldClass} [&>option]:text-neutral-900`}
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  {SERVICES.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Urgência (opcional)
                <select
                  name="urgency"
                  defaultValue=""
                  className={`${fieldClass} [&>option]:text-neutral-900`}
                >
                  <option value="">Sem prazo definido</option>
                  {URGENCY.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-1.5 text-sm font-medium text-white/80">
                <span id="image-label">Imagem opcional</span>

                <input
                  ref={imageInput}
                  name="image"
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  hidden
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  aria-describedby="image-label"
                  aria-label={
                    imageName
                      ? `Alterar imagem: ${imageName}`
                      : "Escolher imagem opcional"
                  }
                  onClick={() => imageInput.current?.click()}
                  className={`${fieldClass} cursor-pointer truncate text-left ${
                    imageName ? "text-white" : "text-white/60"
                  } hover:border-white/30`}
                >
                  {imageName || "Escolher imagem"}
                </button>

                {imageName && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="self-start text-xs text-white/60 underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)]/60"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>

            <label className={labelClass}>
              Mensagem (opcional)
              <textarea
                name="message"
                rows={3}
                maxLength={MESSAGE_MAX}
                onChange={(event) =>
                  setMessageLength(event.target.value.length)
                }
                className={`${fieldClass} resize-y`}
              />
              {messageLength > MESSAGE_MAX * 0.8 && (
                <small className="text-right text-xs text-white/60">
                  {messageLength}/{MESSAGE_MAX}
                </small>
              )}
            </label>

            {/* Honeypot field: hidden from people and assistive tech. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label>
                Website
                <input
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md bg-[var(--gold)] px-6 py-3 text-base font-semibold text-neutral-950 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 sm:self-start"
            >
              {busy ? "A enviar…" : "Enviar pedido →"}
            </button>

            <p
              className={`min-h-[1.5rem] text-sm ${statusClass[status.type]}`}
              role={status.type === "error" ? "alert" : "status"}
              aria-live={status.type === "error" ? "assertive" : "polite"}
            >
              {status.text}
            </p>
          </form>
        </div>

        <nav
          aria-label="Contactos"
          className="mt-12 flex flex-col gap-2 text-base md:mt-16"
        >
          <p className="mb-1 text-sm font-semibold tracking-wide text-white/60">
            Contactos
          </p>

          {CONTACT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-fit text-lg text-white transition-colors hover:text-[var(--gold-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-light)]/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}