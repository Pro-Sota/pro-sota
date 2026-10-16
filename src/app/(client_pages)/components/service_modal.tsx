// src/components/ServiceModal.tsx

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { services } from "@/data/services";
import { SCENES } from "@/scene3d/Scenes";

type ServiceId = (typeof services)[number]["key"];

type ServiceModalProps = {
  serviceId: ServiceId | string | null;
  onClose: () => void;
};

export default function ServiceModal({
  serviceId,
  onClose,
}: ServiceModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const service = services.find((item) => item.key === serviceId);

  const detail = service
    ? {
        ...service,
        items: service.items.map(([title]) => title),
      }
    : null;

  useEffect(() => {
    if (!detail) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [detail, onClose]);

  if (!detail || !serviceId) return null;

  const Scene = SCENES[serviceId as keyof typeof SCENES];

  const serviceIndex = services.findIndex(
    (item) => item.key === serviceId,
  );

  return (
    <div className="service-modal">
      <button
        type="button"
        className="service-modal__backdrop"
        aria-label="Fechar detalhes"
        onClick={onClose}
      />

      <div
        className="service-modal__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="lightbox__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="service-modal__visual" aria-hidden="true">
          <span className="service-modal__number">
            {String(serviceIndex + 1).padStart(2, "0")}
          </span>

          <div className="scene3d__rig">
            {Scene && <Scene />}
          </div>
        </div>

        <div className="service-modal__content">
          <span className="service-modal__eyebrow">
            Serviços PRO SOTA
          </span>

          <h2 id="service-modal-title">{detail.title}</h2>

          <p>{detail.intro}</p>

          <h3>O que fazemos</h3>

          <ul>
            {detail.items.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/portfolio"
            className="service-modal__link"
            onClick={onClose}
          >
            Ver portefólio completo <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}