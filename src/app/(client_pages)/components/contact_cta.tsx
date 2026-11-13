"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { site } from "../content/site";

const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.18em]";
const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

function ArrowUpRightIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

interface ContactCTAProps {
  className?: string;
}

export default function ContactCTA({ className = "" }: ContactCTAProps) {
  const shouldReduceMotion = useReducedMotion();
  const whatsappDigits = site.whatsapp?.replace(/\D/g, "");

  return (
    <section aria-labelledby="contact-cta-title" className={className}>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="grid gap-9 md:grid-cols-[1fr_auto] md:items-end md:gap-12"
      >
        {/* Main message */}
        <div className="max-w-xl">
          <div className="mb-5 flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            <p className={`${EYEBROW} text-gold`}>
              Vamos construir juntos
            </p>
          </div>

          <h2
            id="contact-cta-title"
            className="font-display text-[clamp(1.85rem,3.5vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-paper md:tracking-[-0.04em]"
          >
            Tem um projecto
            <br />
            <span className="text-paper/65">em mente?</span>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/75">
            Partilhe a sua ideia connosco. Da primeira conversa à concretização,
            damos forma ao que imagina.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col items-start gap-3 sm:w-auto md:items-end">
          <Link
            href="/contact"
            className={`group flex w-full items-center justify-between gap-8 border border-gold bg-gold py-2 pl-5 pr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy transition-colors duration-300 hover:border-paper hover:bg-paper sm:w-auto sm:min-w-[210px] ${FOCUS} focus-visible:outline-gold motion-reduce:transition-none`}
          >
            <span>Iniciar conversa</span>

            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center bg-navy text-paper transition-colors duration-300 group-hover:bg-gold group-hover:text-navy motion-reduce:transition-none"
            >
              <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </span>
          </Link>

          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contactar ${site.name ?? "a nossa equipa"} pelo WhatsApp (abre num novo separador)`}
              className={`group inline-flex items-center gap-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/75 transition-colors hover:text-paper ${FOCUS} focus-visible:outline-paper motion-reduce:transition-none`}
            >
              <span
                aria-hidden="true"
                className="h-px w-5 bg-paper/40 transition-[width,background-color] duration-300 group-hover:w-8 group-hover:bg-gold motion-reduce:transition-none"
              />
              <span>WhatsApp</span>
              <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </a>
          )}
        </div>
      </motion.div>
    </section>
  );
}