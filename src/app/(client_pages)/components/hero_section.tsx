
import Image from "next/image";
import Link from "next/link";

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
      <div className="hero__grid" />
      <div className="hero__scan" />

      {/* Planta decorativa, ignorada pelas tecnologias assistivas. */}
      <Image
        className="hero__blueprint"
        src="/assets/img/planta-arquitectonica.svg"
        alt=""
        aria-hidden="true"
        width={800}
        height={800}
        priority
      />

      <div className="hero__inner">
        <div className="hero__eyebrow-row">
          <span className="hero__pin" />

          <span className="hero__eyebrow">
            Angola · Desde 1997
          </span>
        </div>

        <h1>
          <span className="hero__pro">PRO</span>
          <span className="hero__sota">SOTA</span>
        </h1>

        <div className="hero__sub">
          <p className="hero__tagline">
            Onde a arte da arquitectura e a excelência na
            construção se unem para transformar sonhos em
            realidade.
          </p>

          <Link href="/#servicos" className="hero__cta">
            Explorar serviços →
          </Link>

          <div className="hero__meta">
            <div>
              <strong>29</strong>
              anos de experiência
            </div>

            <div>
              <strong>11+</strong>
              grandes projectos
            </div>

            <div>
              <strong>4</strong>
              áreas de actuação
            </div>
          </div>
        </div>
      </div>

      <div className="hero__strip">
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
