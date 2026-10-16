
export default function About() {
  return (
    <section className="about" id="sobre">
      <div className="wrap">
        <div className="about__top reveal is-visible">
          <div>
            <p className="section-label">Apresentação</p>
            <h2>
              Confiança, funcionalidade e valor{" "}
              <em>duradouro.</em>
            </h2>
          </div>

          <p className="about__lede">
            A PRO SOTA assenta numa base sólida de conhecimento
            técnico e prática consolidada ao longo de mais de{" "}
            <strong>29 anos de experiência</strong> no sector da
            arquitectura e construção — do planeamento
            arquitectónico até à execução impecável da obra.
          </p>
        </div>

        <div className="about__stats reveal is-visible">
          <div className="stat">
            <b>29</b>
            <span>
              Anos de experiência no mercado angolano e português
            </span>
          </div>

          <div className="stat">
            <b>4</b>
            <span>
              Áreas de actuação integradas num só serviço
            </span>
          </div>

          <div className="stat">
            <b>11+</b>
            <span>
              Grandes projectos entre Luanda, Lisboa e Madrid
            </span>
          </div>

          <div className="stat">
            <b>1</b>
            <span>
              Equipa multidisciplinar, do terreno aos acabamentos
            </span>
          </div>
        </div>

        <div className="about__body">
          <div className="about__lead">
            <span
              className="about__lead-mark"
              aria-hidden="true"
            >
              "
            </span>

            <p>
              Não entregamos apenas projectos — entregamos
              confiança, funcionalidade e valor duradouro.
            </p>
          </div>

          <div className="about__cols">
            <p>
              Somos uma empresa angolana especializada em
              arquitectura, engenharia, construção e fiscalização,
              comprometida com excelência técnica, estética moderna
              e respeito pelos prazos. A nossa abordagem é centrada
              no cliente: ouvimos, compreendemos, propomos soluções
              e executamos com rigor.
            </p>

            <p>
              Cada projecto é tratado com o máximo de cuidado e
              atenção aos detalhes, garantindo que o resultado final
              seja uma verdadeira expressão das suas ideias — dentro
              dos prazos estabelecidos e com o mais alto padrão de
              qualidade.
            </p>
          </div>
        </div>

        <div className="about__signoff reveal is-visible">
          <div>
            <b>Arquitecto Társis Soma</b>
            <span>Responsável técnico, PRO SOTA</span>
          </div>

          <a href="mailto:geral@prosota.ao">
            geral@prosota.ao
          </a>
        </div>
      </div>
    </section>
  );
}
