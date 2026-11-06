
"use client";

/*
 * Formulário público enviado como JSON para /api/contact.
 * A imagem opcional é convertida numa data URL.
 * A validação definitiva pertence à API.
 */

import { useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

export default function Contact() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageName, setImageName] = useState("");

  const imageInput = useRef<HTMLInputElement>(null);

  // Converte a imagem seleccionada numa data URL.
  function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Não foi possível processar a imagem."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler a imagem seleccionada."));
      };

      reader.readAsDataURL(file);
    });
  }

  // Actualiza o nome da imagem seleccionada.
  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageName(event.target.files?.[0]?.name || "");
  }

  // Recolhe os campos, prepara a imagem e envia o pedido.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setStatus("");

    const form = event.currentTarget;

    try {
      const formData = new FormData(form);

      const payload: Record<string, string> = {};

      formData.forEach((value, key) => {
        if (key !== "image" && typeof value === "string") {
          payload[key] = value;
        }
      });

      const file = formData.get("image");

      if (file instanceof File && file.size > 0) {
        if (file.size > 3_000_000) {
          setStatus("A imagem deve ter até 3 MB.");
          return;
        }

        payload.imageName = file.name;
        payload.image = await readImage(file);
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível enviar o pedido.");
      }

      setStatus(
        "Pedido recebido. Entraremos em contacto consigo em breve."
      );

      form.reset();
      setImageName("");
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
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Peça um orçamento</h3>

            <div className="contact-form__grid">
              <label>
                Nome *
                <input
                  name="name"
                  required
                  maxLength={120}
                />
              </label>

              <label>
                Email (opcional)
                <input
                  name="email"
                  type="email"
                  maxLength={200}
                />
              </label>

              <label>
                Telefone *
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={50}
                />
              </label>

              <label>
                Tipo de serviço *
                <select
                  name="service"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  <option>Arquitectura</option>
                  <option>Engenharia</option>
                  <option>Construção</option>
                  <option>Fiscalização e consultoria</option>
                  <option>Outro</option>
                </select>
              </label>

              <label>
                Urgência (opcional)
                <select name="urgency" defaultValue="">
                  <option value="">Sem prazo definido</option>
                  <option>Imediata</option>
                  <option>Até 1 mês</option>
                  <option>1 a 3 meses</option>
                </select>
              </label>

              {/* Campo nativo oculto; o botão apresenta o nome do ficheiro. */}
              <div className="contact-form__upload">
                <span>Imagem opcional</span>

                <input
                  ref={imageInput}
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
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
