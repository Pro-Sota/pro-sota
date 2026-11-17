
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";

import { submitContact } from "@/actions/contact_submission";
import CustomSelect from "@/app/components/custom_select";
import { useToast } from "@/app/components/toast/use_toast";

export default function Contact() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageName, setImageName] = useState("");

  const imageInput = useRef<HTMLInputElement>(null);
  const toast = useToast();

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setImageName(file?.name || "");
    setStatus("");

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setStatus("Seleccione uma imagem PNG, JPEG ou WebP.");
      event.target.value = "";
      setImageName("");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setStatus("A imagem deve ter até 3 MB.");
      event.target.value = "";
      setImageName("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    const form = event.currentTarget;
    const file = imageInput.current?.files?.[0];

    setBusy(true);
    setStatus("");

    try {
      if (file && file.size > 3 * 1024 * 1024) {
        throw new Error("A imagem deve ter até 3 MB.");
      }

      const formData = new FormData(form);
      const result = await submitContact(formData);

      if (!result.success) {
        throw new Error(
          result.error || "Não foi possível enviar o pedido."
        );
      }

      toast.success(
        "Pedido enviado com sucesso! Entraremos em contacto consigo em breve."
      );

      form.reset();
      setImageName("");

      if (imageInput.current) {
        imageInput.current.value = "";
      }
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar. Tente novamente."
      );
    } finally {
      setBusy(false);
    }
  }
  const inputClass =
    "mt-2 min-h-11 w-full rounded-sm border border-white/15 bg-[#292824] px-3 py-2 text-sm text-[#F7F7F5] outline-none transition-colors duration-200 placeholder:text-[#AAB4BE]/50 focus:border-[#BD9655] focus:ring-1 focus:ring-[#BD9655]/25 disabled:cursor-not-allowed disabled:opacity-50";

  const labelClass =
    "block min-w-0 text-xs font-medium tracking-wide text-[#F7F7F5]/75";

  const contactLinkClass =
    "block w-fit text-sm text-[#F7F7F5]/85 transition-colors duration-300 hover:text-[#D7B477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B477]";
 
    return (
    <section
      id="contacto"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden bg-[#1F1E1B] pt-32 pb-12 text-[#F7F7F5] sm:pt-36 sm:pb-14" >
      {/* Architectural background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]
          [background-image:linear-gradient(to_right,rgba(247,247,245,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(247,247,245,0.2)_1px,transparent_1px)]
          [background-size:64px_64px]
          [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_85%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <p className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D7B477]">
          <span className="h-px w-7 bg-[#BD9655]" aria-hidden="true" />
          Vamos conversar
        </p>

        <h2
          id="contact-title"
          className="mt-4 max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] font-bold uppercase leading-[1.05] tracking-[-0.035em] text-[#F7F7F5]"
        >
          O seu próximo projecto{" "}
          <em className="not-italic text-[#D7B477]">
            começa aqui.
          </em>
        </h2>

        {/* Main content */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.65fr)] lg:gap-16 xl:gap-20">
          {/* Form */}
          <form
            className="min-w-0"
            onSubmit={handleSubmit}
          >
            <h3 className="mb-7 text-lg font-medium tracking-tight text-[#F7F7F5]">
              Peça um orçamento
            </h3>

            <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2">
              <label className={labelClass}>
                Nome *
                <input
                  className={inputClass}
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="name"
                  disabled={busy}
                />
              </label>

              <label className={labelClass}>
                Email (opcional)
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                  disabled={busy}
                />
              </label>

              <label className={labelClass}>
                Telefone *
                <input
                  className={inputClass}
                  name="phone"
                  type="tel"
                  required
                  maxLength={50}
                  autoComplete="tel"
                  disabled={busy}
                />
              </label>

              <label className={labelClass}>
                Tipo de serviço *
                <CustomSelect
                  name="service"
                  required
                  defaultValue=""
                  disabled={busy}
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  <option value="Arquitectura" className="text-black">
                    Arquitectura
                  </option>
                  <option value="Engenharia" className="text-black">
                    Engenharia
                  </option>
                  <option value="Construção" className="text-black">
                    Construção
                  </option>
                  <option
                    value="Fiscalização e consultoria"
                    className="text-black"
                  >
                    Fiscalização e consultoria
                  </option>
                  <option value="Outro" className="text-black">
                    Outro
                  </option>
                </CustomSelect>
              </label>

              <label className={labelClass}>
                Prazo previsto (opcional)
                <CustomSelect
                  name="urgency"
                  defaultValue=""
                  disabled={busy}
                >
                  <option value="" className="text-black">
                    Ainda por definir
                  </option>
                  <option value="Imediato" className="text-black">
                    O mais breve possível
                  </option>
                  <option value="Até 1 mês" className="text-black">
                    Nos próximos 30 dias
                  </option>
                  <option value="1 a 3 meses" className="text-black">
                    Dentro de 1 a 3 meses
                  </option>
                  <option value="Mais de 3 meses" className="text-black">
                    Daqui a mais de 3 meses
                  </option>
                </CustomSelect>
              </label>

              {/* Optional image */}
              <div className="min-w-0">
                <span className={labelClass}>
                  Imagem opcional
                </span>

                <input
                  ref={imageInput}
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  disabled={busy}
                  onChange={handleImageChange}
                />

                <button
                  type="button"
className="mt-2 flex min-h-11 w-full min-w-0 items-center gap-2 rounded-sm border border-dashed border-white/20 bg-[#292824] px-3 text-left text-sm text-[#AAB4BE] transition-colors duration-200 hover:border-[#BD9655] hover:text-[#D7B477] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D7B477] disabled:cursor-not-allowed disabled:opacity-50"                  aria-label={
                    imageName
                      ? `Alterar imagem: ${imageName}`
                      : "Escolher imagem opcional"
                  }
                  disabled={busy}
                  onClick={() => imageInput.current?.click()}
                >
                  <span className="shrink-0 text-[#D7B477]">
                    +
                  </span>

                  <span className="truncate">
                    {imageName || "Escolher imagem"}
                  </span>
                </button>
              </div>
            </div>

            {/* Message */}
            <label className={`${labelClass} mt-6`}>
              Mensagem (opcional)
              <textarea
className="mt-2 min-h-28 w-full resize-y rounded-sm border border-white/15 bg-[#292824] px-3 py-3 text-sm text-[#F7F7F5] outline-none transition-colors duration-200 placeholder:text-[#AAB4BE]/50 focus:border-[#BD9655] focus:ring-1 focus:ring-[#BD9655]/25 disabled:cursor-not-allowed disabled:opacity-50"                name="message"
                rows={3}
                maxLength={4000}
                disabled={busy}
              />
            </label>

            {/* Submit */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center bg-[#BD9655] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#051221] transition-colors duration-300 hover:bg-[#D7B477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B477] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy}
              >
                {busy ? "A enviar…" : "Enviar pedido →"}
              </button>

              <p
                className="text-xs text-red-200"
                role="status"
                aria-live="polite"
              >
                {status}
              </p>
            </div>
          </form>

          {/* Contact information */}
          <aside className="grid min-w-0 gap-y-2 border-t border-white/15 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7B477]">
              <span className="h-px w-6 bg-[#BD9655]" aria-hidden="true" />
              Contactos
            </p>

            <h3 className="mb-9 max-w-[18ch] text-xl font-medium leading-snug tracking-tight text-[#F7F7F5] sm:text-2xl">
              Estamos disponíveis para conversar.
            </h3>

            <div className="grid gap-9">
              {/* Telephone */}
              <div className="grid gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D7B477]">
                  Telefone
                </span>

                <div className="grid gap-3">
                  <Link
                    href="tel:+244947803610"
                    className={contactLinkClass}
                  >
                    +244 947 803 610
                  </Link>

                  <Link
                    href="tel:+244947804186"
                    className={contactLinkClass}
                  >
                    +244 947 804 186
                  </Link>
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D7B477]">
                  Email
                </span>

                <Link
                  href="mailto:geral@prosota.ao"
                  className={contactLinkClass}
                >
                  geral@prosota.ao
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
