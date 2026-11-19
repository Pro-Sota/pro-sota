
import { services } from "./servicesData";

import Link from "next/link";
import "../../admin.css";
import "../../styles.css";

export default function Services() {
  return (
    <section
      className="services relative overflow-hidden bg-cream py-[clamp(80px,12vh,120px)] font-body"
      id="servicos"
    >
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)]">
        <div className="reveal is-visible mb-[clamp(40px,6vh,64px)] flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="section-label">Serviços prestados</p>

            <h2 className="max-w-[16ch] font-body text-[clamp(26px,3.2vw,40px)] leading-[1.08] font-medium tracking-[-0.04em] text-navy">
              Quatro áreas, uma só visão
            </h2>
          </div>

          <p className="max-w-[40ch] text-[14.5px] leading-[1.6] text-ink-soft">
            Soluções integradas para cada fase do seu projecto.
          </p>
        </div>

        <div className="reveal is-visible grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.key}
              className="min-h-[230px] border border-navy/15 bg-white/35 p-5 lg:p-6"
            >
              <span className="mb-5 block font-body text-[14px] font-medium tracking-[0.08em] text-gold-dim">
                {service.num}
              </span>

              <h3 className="mb-3 font-body text-[17px] leading-[1.3] font-medium tracking-[-0.02em] text-navy">
                {service.title}
              </h3>

              <p className="text-[13.5px] leading-[1.6] text-ink-soft">
                {service.label}
              </p>

              <ul className="services__subservices mt-4 space-y-1.5 border-t border-navy/15 pt-3 text-[13px] leading-[1.5] text-navy">
                {service.items.map(([title]) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <Link
            className="border-b border-gold-dim pb-1 font-body text-sm font-medium tracking-[0.04em] text-navy transition-colors hover:text-gold-dim"
            href="/servicos"
          >
            Mais informações
          </Link>
        </div>
      </div>
    </section>
  );
}
