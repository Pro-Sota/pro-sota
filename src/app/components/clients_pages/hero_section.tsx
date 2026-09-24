/*
 * Destaque inicial com planta decorativa, indicadores e ligação aos serviços.
 * A repetição dos nomes na faixa permite o movimento contínuo definido no CSS.
 */
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__grid" />
      <div className="hero__scan" />
      {/* A planta é decorativa e fica fora da leitura por tecnologias assistivas. */}
      <img className="hero__blueprint" src="/assets/img/planta-arquitectonica.svg" alt="" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__eyebrow-row">
          <span className="hero__pin" />
          <span className="hero__eyebrow">Angola · Desde 1997</span>
        </div>
        <h1><span className="hero__pro">PRO</span><span className="hero__sota">SOTA</span></h1>
        <div className="hero__sub">
          <p className="hero__tagline">Onde a arte da arquitectura e a excelência na construção se unem para transformar sonhos em realidade.</p>
          <a href="#servicos" className="hero__cta">Explorar serviços →</a>
          <div className="hero__meta">
            <div><strong>29</strong>anos de experiência</div>
            <div><strong>11+</strong>grandes projectos</div>
            <div><strong>4</strong>áreas de actuação</div>
          </div>
        </div>
      </div>

      <div className="hero__strip">
        <div className="hero__strip-track">
          {['Arquitectura', 'Engenharia', 'Construção & Obras Públicas', 'Fiscalização & Consultoria',
            'Arquitectura', 'Engenharia', 'Construção & Obras Públicas', 'Fiscalização & Consultoria'].map((t, i) => (
            <span key={i}>{t}<b></b></span>
          ))}
        </div>
      </div>

      <div className="scrolldown"><span>Scroll</span><div className="scrolldown__line"><i></i></div></div>
    </section>
  );
}

