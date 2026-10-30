
export default function About() {
  const stats = [
    {
      value: "29+",
      label: "Anos de experiência",
      detail: "Desde 1997",
    },
    {
      value: "04",
      label: "Áreas de actuação",
      detail: "Soluções integradas",
    },
    {
      value: "11+",
      label: "Grandes projectos",
      detail: "Angola e internacional",
    },
    {
      value: "01",
      label: "Equipa multidisciplinar",
      detail: "Uma visão partilhada",
    },
  ];

  return (
    <section
      id="sobre"
      className="relative scroll-mt-24 overflow-hidden bg-[#F7F7F5] py-24 md:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">

        {/* SECTION INTRODUCTION */}

        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#BD9655]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#002950]/60 md:text-xs">
                01 / Apresentação
              </p>
            </div>

            <p className="mt-8 hidden max-w-[220px] text-sm leading-7 text-[#85898C] lg:block">
              Uma empresa angolana. Uma visão integrada.
              Um compromisso com a qualidade.
            </p>
          </div>

          <div>
            <h2 className="max-w-5xl text-[clamp(3.2rem,7vw,7rem)] font-medium leading-[0.96] tracking-[-0.075em] text-[#002950]">
              Construímos com rigor.
              <span className="mt-2 block font-normal italic text-[#BD9655]">
                Criamos valor que permanece.
              </span>
            </h2>

            <div className="mt-10 grid gap-6 border-t border-[#002950]/15 pt-7 md:grid-cols-[1fr_1.2fr] md:gap-12">
              <p className="text-sm font-medium leading-7 text-[#002950] md:text-base">
                Conhecimento técnico, experiência e uma visão
                integrada da arquitectura e construção.
              </p>

              <p className="max-w-xl text-sm leading-8 text-[#73777C] md:text-base">
                A PRO SOTA assenta numa base sólida de conhecimento
                técnico e experiência consolidada ao longo de mais
                de <strong className="font-semibold text-[#002950]">29 anos de actividade</strong>.
                Acompanhamos cada projecto desde o planeamento
                arquitectónico até à execução da obra, com rigor,
                atenção ao detalhe e compromisso com a qualidade.
              </p>
            </div>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="mt-20 border-y border-[#002950]/15 md:mt-28">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`
                  group relative py-8 md:py-10
                  ${index % 2 === 1 ? "border-l border-[#002950]/15 pl-6 md:pl-8" : "pr-6 md:pr-8"}
                  ${index >= 2 ? "border-t border-[#002950]/15 md:border-t-0" : ""}
                  ${index >= 2 ? "md:border-l md:pl-8" : ""}
                `}
              >
                <span className="text-[clamp(3rem,5vw,5rem)] font-medium leading-none tracking-[-0.075em] text-[#002950] transition-colors duration-300 group-hover:text-[#BD9655]">
                  {stat.value}
                </span>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#002950] md:text-sm">
                  {stat.label}
                </p>

                <p className="mt-2 text-xs text-[#85898C]">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* COMPANY APPROACH */}

        <div className="mt-20 grid gap-12 lg:mt-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="relative">
            <span className="block text-7xl font-serif leading-[0.6] text-[#BD9655]">
              “
            </span>

            <blockquote className="mt-6 max-w-md text-3xl font-medium leading-[1.2] tracking-[-0.045em] text-[#002950] md:text-4xl">
              Não entregamos apenas projectos.
              <span className="text-[#BD9655]">
                {" "}Entregamos confiança, funcionalidade e valor duradouro.
              </span>
            </blockquote>

            <div className="mt-9 h-px w-16 bg-[#BD9655]" />
          </div>

          <div className="flex flex-col justify-between">
            <div className="grid gap-8 md:grid-cols-2">
              <p className="text-sm leading-8 text-[#73777C] md:text-base">
                Somos uma empresa angolana especializada em
                arquitectura, engenharia, construção e fiscalização,
                comprometida com a excelência técnica, a estética
                contemporânea e o cumprimento dos prazos. A nossa
                abordagem é centrada no cliente: ouvimos,
                compreendemos, propomos soluções e executamos com rigor.
              </p>

              <p className="text-sm leading-8 text-[#73777C] md:text-base">
                Cada projecto é acompanhado com cuidado e atenção
                aos detalhes, procurando garantir resultados que
                correspondam às expectativas e necessidades de cada
                cliente, respeitando os prazos estabelecidos e os
                mais elevados padrões de qualidade.
              </p>
            </div>

            {/* SIGNATURE */}

            <div className="mt-12 flex flex-col justify-between gap-6 border-t border-[#002950]/15 pt-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-base font-semibold tracking-tight text-[#002950]">
                  Arquitecto Társis Soma
                </p>

                <p className="mt-1 text-xs text-[#85898C]">
                  Responsável técnico · PRO SOTA
                </p>
              </div>

              <a
                href="mailto:geral@prosota.ao"
                className="group inline-flex items-center gap-3 text-sm font-semibold text-[#002950] transition-colors hover:text-[#BD9655]"
              >
                geral@prosota.ao

                <span className="text-[#BD9655] transition-transform duration-300 group-hover:translate-x-1">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
