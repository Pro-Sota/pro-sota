import Image from "next/image";

const SERVICES = [
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

      {/* Planta arquitectónica decorativa */}
      <Image
        className="hero__blueprint"
        src="/images/planta-arquitectonica.svg"
        alt=""
        aria-hidden="true"
        width={1200}
        height={900}
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
            Onde a arte da arquitectura e a excelência na construção se
            unem para transformar sonhos em realidade.
          </p>

          <a href="#servicos" className="hero__cta">
            Explorar serviços <span aria-hidden="true">→</span>
          </a>

          <div className="hero__meta">
            <div>
              <strong>29</strong>
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

      <div className="hero__strip">
        <div className="hero__strip-track">
          {[...SERVICES, ...SERVICES].map((service, index) => (
            <span key={`${service}-${index}`}>
              {service}
              <b aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <div className="scrolldown">
        <span>Scroll</span>
        <div className="scrolldown__line">
          <i />
        </div>
      </div>
    </section>
  );
}