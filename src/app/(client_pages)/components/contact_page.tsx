
"use client";

import { useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import { submitContact } from "@/actions/contact_submission";
import CustomSelect from "@/app/components/custom_select";
import { useToast } from "@/app/components/toast/use_toast";

export default function Contact() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageName, setImageName] = useState("");

  const imageInput = useRef<HTMLInputElement>(null);

  const toast = useToast();

  // Actualiza o nome da imagem seleccionada.
  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setImageName(file?.name || "");
    setStatus("");

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

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

  // Envia os dados directamente para a Server Action.
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
          "Pedido enviado com sucesso! Entraremos em contacto consigo em breve.",
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

  return (
    <section className="contact" id="contacto">
      <div className="contact__grid" />

      <div className="wrap contact__inner">
        <p
          className="section-label"
          style={{ color: "var(--gold-light)" }}
        >
          Vamos conversar
        </p>

        <h2>
          Prontos para construir <em>o futuro</em> consigo.
        </h2>

        <div className="contact__content">
          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <h3>Peça um orçamento</h3>

            <div className="contact-form__grid">
              <label>
                Nome *
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="name"
                  disabled={busy}
                />
              </label>

              <label>
                Email (opcional)
                <input
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                  disabled={busy}
                />
              </label>

              <label>
                Telefone *
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={50}
                  autoComplete="tel"
                  disabled={busy}
                />
              </label>

              <label>
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
                  <option value="Arquitectura">
                    Arquitectura
                  </option>
                  <option value="Engenharia">
                    Engenharia
                  </option>
                  <option value="Construção">
                    Construção
                  </option>
                  <option value="Fiscalização e consultoria">
                    Fiscalização e consultoria
                  </option>
                  <option value="Outro">
                    Outro
                  </option>
                </CustomSelect>
              </label>

              <label>
                Urgência (opcional)
                <CustomSelect
                  name="urgency"
                  defaultValue=""
                  disabled={busy}
                >
                  <option value="">
                    Sem prazo definido
                  </option>
                  <option value="Imediata">
                    Imediata
                  </option>
                  <option value="Até 1 mês">
                    Até 1 mês
                  </option>
                  <option value="1 a 3 meses">
                    1 a 3 meses
                  </option>
                </CustomSelect>
              </label>

              <div className="contact-form__upload">
                <span>Imagem opcional</span>

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
                  className="contact-form__file-button"
                  aria-label={
                    imageName
                      ? `Alterar imagem: ${imageName}`
                      : "Escolher imagem opcional"
                  }
                  disabled={busy}
                  onClick={() => imageInput.current?.click()}
                >
                  {imageName || "Escolher imagem"}
                </button>
              </div>
            </div>

            <label>
              Mensagem (opcional)
              <textarea
                name="message"
                rows={2}
                maxLength={4000}
                disabled={busy}
              />
            </label>

            <button
              type="submit"
              className="contact__cta"
              disabled={busy}
            >
              {busy ? "A enviar…" : "Enviar pedido →"}
            </button>

            <p role="status" aria-live="polite">
              {status}
            </p>
          </form>
        </div>

        <div className="contact-links">
          <p>Contactos</p>

          <a href="tel:+244947803610">
            +244 947 803 610
          </a>

          <a href="tel:+244947804186">
            +244 947 804 186
          </a>

          <a href="mailto:geral@prosota.ao">
            geral@prosota.ao
          </a>
        </div>
      </div>
    </section>
  );
}
