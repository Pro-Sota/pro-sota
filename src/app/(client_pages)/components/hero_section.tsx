import Image from "next/image";
import Link from "next/link";

const FOUNDING_YEAR = 1997;

const YEARS_OF_EXPERIENCE =
  new Date().getFullYear() - FOUNDING_YEAR;

const services = [
  "Arquitectura",
  "Engenharia",
  "Construção & Obras Públicas",
  "Fiscalização & Consultoria",
  "Arquitectura",
  "Engenharia",
  "Construção & Obras Públicas",
  "Fiscalização & Consultoria",
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      {/* Decorative background effects */}
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__scan" aria-hidden="true" />

      {/* Decorative architectural blueprint */}
      <Image
        className="hero__blueprint"
        src="/images/planta-arquitectonica.svg"
        alt=""
        aria-hidden="true"
        width={800}
        height={800}
        priority
      />

      <div className="hero__inner">
        <div className="hero__eyebrow-row">
          <span className="hero__pin" aria-hidden="true" />

          <span className="hero__eyebrow">
            Angola · Desde {FOUNDING_YEAR}
          </span>
        </div>

        <h1 aria-label="PRO SOTA">
          <span className="hero__pro" aria-hidden="true">
            PRO
          </span>
          <span className="hero__sota" aria-hidden="true">
            SOTA
          </span>
        </h1>

        <div className="hero__sub">
          <p className="hero__tagline">
            Onde a arte da arquitectura e a excelência na
            construção se unem para transformar sonhos em
            realidade.
          </p>

          <div className="hero__actions">
            <Link href="/#servicos" className="hero__cta">
              Explorar serviços
              <span aria-hidden="true"> →</span>
            </Link>

            <Link
              href="/#contacto"
              className="hero__cta hero__cta--secondary"
            >
              Fale connosco
              <span aria-hidden="true"> →</span>
            </Link>
          </div>

          <div
            className="hero__meta"
            aria-label="PRO SOTA em números"
          >
            <div>
              <strong>{YEARS_OF_EXPERIENCE}</strong>
              <span>anos de experiência</span>
            </div>

            <div>
              <strong>11+</strong>
              <span>grandes projectos</span>
            </div>

            <div>
              <strong>4</strong>
              <span>áreas de actuação</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative ticker; duplicated labels are hidden from screen readers. */}
      <div className="hero__strip" aria-hidden="true">
        <div className="hero__strip-track">
          {services.map((service, index) => (
            <span key={`${service}-${index}`}>
              {service}
              <b aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <div className="scrolldown" aria-hidden="true">
        <span>Scroll</span>

        <div className="scrolldown__line">
          <i />
        </div>
      </div>
    </section>
  );
}