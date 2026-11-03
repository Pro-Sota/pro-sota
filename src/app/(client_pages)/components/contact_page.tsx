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

const PHONES = [
  { href: "tel:+244947803610", label: "+244 947 803 610" },
  { href: "tel:+244947804186", label: "+244 947 804 186" },
];

const EMAIL = { href: "mailto:geral@prosota.ao", label: "geral@prosota.ao" };

type Status = { type: "idle" | "success" | "error"; text: string };

const IDLE: Status = { type: "idle", text: "" };

/* Tailwind class groups */
const labelClass = "flex flex-col gap-2 text-[13px] font-medium text-white/70";

const fieldBase =
  "w-full border border-white/20 bg-transparent px-3.5 text-sm text-white " +
  "placeholder:text-white/40 transition-colors hover:border-white/40 " +
  "focus:border-gold focus:outline-none focus-visible:ring-1 focus-visible:ring-gold " +
  "disabled:opacity-60";

const inputClass = `${fieldBase} h-11`;
const textareaClass = `${fieldBase} resize-y py-3`;

// Two fields per row on larger screens, using flex instead of grid
const half = "w-full sm:w-[calc(50%-0.625rem)]";

const statusClass: Record<Status["type"], string> = {
  idle: "text-transparent",
  success: "text-gold",
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
      className="relative scroll-mt-24 overflow-hidden bg-ink py-4 text-white md:py-28"
    >
      {/* Faint blueprint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-12 lg:px-16">
        {/* TITLE */}
        <div className="mb-8 flex items-center gap-3 text-sm font-medium text-white/70">
          <span aria-hidden className="h-0.5 w-10 bg-gold" />
          Contacto
        </div>

        <h2
          id="contact-title"
          className="max-w-2xl text-[clamp(1.875rem,3.2vw,3rem)] font-semibold leading-[1.1] tracking-[-0.035em]"
        >
          Prontos para construir
          <span className="block text-white/45">o futuro consigo.</span>
        </h2>

        <div className="mt-12 flex flex-col gap-14 md:mt-16 lg:flex-row lg:gap-20">
          {/* FORM */}
          <form
            onSubmit={submit}
            aria-busy={busy}
            className="relative flex w-full min-w-0 flex-1 flex-col gap-5"
          >
            <h3 className="border-b border-white/15 pb-4 text-lg font-semibold">
              Peça um orçamento
            </h3>

            <div className="flex flex-wrap gap-5">
              <label className={`${labelClass} ${half}`}>
                Nome *
                <input
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} ${half}`}>
                Email (opcional)
                <input
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                  inputMode="email"
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} ${half}`}>
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
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} ${half}`}>
                Tipo de serviço *
                <select
                  name="service"
                  required
                  defaultValue=""
                  className={`${inputClass} [&>option]:text-ink`}
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

              <label className={`${labelClass} ${half}`}>
                Urgência (opcional)
                <select
                  name="urgency"
                  defaultValue=""
                  className={`${inputClass} [&>option]:text-ink`}
                >
                  <option value="">Sem prazo definido</option>
                  {URGENCY.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div
                className={`flex flex-col gap-2 text-[13px] font-medium text-white/70 ${half}`}
              >
                <span id="image-label">Imagem (opcional)</span>

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
                  className={`${inputClass} cursor-pointer truncate text-left ${
                    imageName ? "text-white" : "text-white/50"
                  }`}
                >
                  {imageName || "Escolher imagem"}
                </button>

                {imageName && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="self-start text-xs text-white/60 underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
                  >
                    Remover imagem
                  </button>
                )}
              </div>

              <label className={`${labelClass} w-full`}>
                Mensagem (opcional)
                <textarea
                  name="message"
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  onChange={(event) =>
                    setMessageLength(event.target.value.length)
                  }
                  className={textareaClass}
                />
                {messageLength > MESSAGE_MAX * 0.8 && (
                  <small className="text-right text-xs text-white/60">
                    {messageLength}/{MESSAGE_MAX}
                  </small>
                )}
              </label>
            </div>

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
              className="inline-flex h-12 items-center justify-center bg-gold px-8 text-sm font-semibold text-ink transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 sm:self-start"
            >
              {busy ? "A enviar…" : "Enviar pedido"}
            </button>

            <p
              className={`min-h-[1.5rem] text-sm ${statusClass[status.type]}`}
              role={status.type === "error" ? "alert" : "status"}
              aria-live={status.type === "error" ? "assertive" : "polite"}
            >
              {status.text}
            </p>
          </form>

          {/* CONTACT INFO COLUMN */}
          <aside
            aria-label="Contactos"
            className="flex flex-col gap-8 border-t border-white/15 pt-10 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
          >
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-white/50">Telefone</p>
              {PHONES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-base text-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-white/50">Email</p>
              <Link
                href={EMAIL.href}
                className="w-fit text-base text-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {EMAIL.label}
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-white/50">Localização</p>
              <p className="text-base text-white">Luanda, Angola</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}