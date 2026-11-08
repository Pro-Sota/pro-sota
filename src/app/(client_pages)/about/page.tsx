"use client";

import Link from "next/link";

const values = [
  {
    number: "01",
    title: "Rigor",
    description:
      "Trabalhamos com precisão, responsabilidade e atenção ao detalhe em todas as fases de cada projecto.",
  },
  {
    number: "02",
    title: "Compromisso",
    description:
      "Assumimos cada desafio com dedicação, transparência e responsabilidade perante os nossos clientes.",
  },
  {
    number: "03",
    title: "Excelência",
    description:
      "Procuramos soluções que conciliam qualidade técnica, funcionalidade e valor arquitectónico.",
  },
  {
    number: "04",
    title: "Visão",
    description:
      "Pensamos no futuro, desenvolvendo espaços e infra-estruturas preparados para responder às necessidades de amanhã.",
  },
];

const expertise = [
  {
    number: "01",
    title: "Arquitectura",
    description:
      "Concepção arquitectónica, planeamento e desenvolvimento de espaços que equilibram estética, funcionalidade e contexto.",
  },
  {
    number: "02",
    title: "Engenharia",
    description:
      "Soluções de engenharia integradas, sustentadas pelo rigor técnico e pela eficiência construtiva.",
  },
  {
    number: "03",
    title: "Construção",
    description:
      "Execução e gestão de obras, assegurando qualidade, coordenação e controlo em todas as etapas.",
  },
  {
    number: "04",
    title: "Fiscalização e Consultoria",
    description:
      "Acompanhamento técnico, fiscalização e consultoria para garantir o cumprimento dos requisitos de cada projecto.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#F7F7F5] text-[#002950]">
      {/* HERO */}
      <section className="relative flex min-h-[78vh] flex-col justify-end overflow-hidden bg-[#002950] px-6 pb-16 pt-36 text-[#F7F7F5] md:px-12 md:pb-24 lg:px-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#002950]/95 via-[#002950]/65 to-[#002950]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002950]/80 via-transparent to-[#002950]/20" />
          <img
            src=""
            alt="Projecto de arquitectura PRO SOTA"
            className="h-full w-full object-cover opacity-60"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1600px]">
          <span className="mb-8 block text-xs font-semibold uppercase tracking-[0.3em] text-[#BD9655]">
            PRO SOTA · Angola · Desde 1997
          </span>

          <h1 className="max-w-5xl text-6xl font-semibold uppercase leading-[0.92] tracking-tight md:text-8xl lg:text-[112px]">
            Construímos
            <br />
            com visão.
          </h1>

          <div className="mt-10 flex max-w-2xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-lg text-base leading-7 text-white/75 md:text-lg">
              Somos uma empresa multidisciplinar que transforma ideias em
              projectos, projectos em realidade e desafios em oportunidades
              para construir o futuro.
            </p>

            <a
              href="#nossa-historia"
              className="w-fit border-b border-[#BD9655] pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#BD9655] transition-colors hover:text-white"
            >
              Conheça-nos <span className="ml-3">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section
        id="nossa-historia"
        className="px-6 py-24 md:px-12 md:py-32 lg:px-20"
      >
        <div className="mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BD9655]">
              01 / Quem somos
            </span>

            <h2 className="mt-8 text-5xl font-semibold uppercase leading-[1.02] tracking-tight md:text-6xl">
              Experiência
              <br />
              que constrói.
              <br />
              Visão que
              <br />
              transforma.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-xl leading-relaxed text-[#002950] md:text-2xl">
              Desde 1997, a PRO SOTA participa na transformação do ambiente
              construído, desenvolvendo soluções nas áreas da arquitectura,
              engenharia, construção e fiscalização.
            </p>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#002950]/65">
              A nossa abordagem assenta na integração de diferentes
              especialidades, permitindo acompanhar os projectos de forma
              abrangente — desde a ideia inicial até à concretização da obra.
              Valorizamos o conhecimento técnico, a colaboração e a capacidade
              de encontrar soluções adequadas a cada contexto.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#002950]/65">
              Mais do que construir edifícios e infra-estruturas, procuramos
              criar valor duradouro para os nossos clientes, parceiros e para
              as comunidades onde trabalhamos.
            </p>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="border-y border-[#002950]/10 px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-y-12 md:grid-cols-4">
          {[
            { value: "29+", label: "Anos de experiência" },
            { value: "11+", label: "Grandes projectos" },
            { value: "03", label: "Cidades de presença" },
            { value: "04", label: "Áreas de especialidade" },
          ].map((stat) => (
            <div key={stat.label} className="border-l border-[#BD9655] pl-5">
              <span className="text-5xl font-semibold tracking-tight md:text-6xl">
                {stat.value}
              </span>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-[#002950]/55">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="grid bg-[#002950] text-[#F7F7F5] md:grid-cols-2">
        <div className="border-b border-white/15 px-6 py-20 md:border-b-0 md:border-r md:px-12 md:py-28 lg:px-20">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BD9655]">
            02 / A nossa missão
          </span>

          <h2 className="mt-10 text-5xl font-semibold uppercase leading-[1.05] tracking-tight md:text-6xl">
            Dar forma
            <br />
            às ideias.
          </h2>

          <p className="mt-8 max-w-lg text-base leading-8 text-white/65">
            Desenvolver e concretizar projectos de arquitectura, engenharia
            e construção com qualidade, rigor e responsabilidade, criando
            soluções que respondem às necessidades dos nossos clientes e
            contribuem para o desenvolvimento das comunidades.
          </p>
        </div>

        <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BD9655]">
            03 / A nossa visão
          </span>

          <h2 className="mt-10 text-5xl font-semibold uppercase leading-[1.05] tracking-tight md:text-6xl">
            Construir
            <br />
            o futuro.
          </h2>

          <p className="mt-8 max-w-lg text-base leading-8 text-white/65">
            Ser uma referência de confiança e excelência no sector da
            arquitectura, engenharia e construção, reconhecida pela capacidade
            de inovar, integrar competências e transformar positivamente o
            espaço construído.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BD9655]">
                04 / O que nos define
              </span>
              <h2 className="mt-7 text-5xl font-semibold uppercase tracking-tight md:text-7xl">
                Os nossos valores.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-[#002950]/60">
              Os princípios que orientam a nossa forma de trabalhar, as
              decisões que tomamos e as relações que construímos.
            </p>
          </div>

          <div className="grid border-t border-[#002950]/15 md:grid-cols-2">
            {values.map((item) => (
              <article
                key={item.number}
                className="border-b border-[#002950]/15 py-9 md:px-8 md:py-12 md:even:border-l md:first:pl-0 md:even:pr-0"
              >
                <span className="text-xs font-semibold tracking-widest text-[#BD9655]">
                  {item.number}
                </span>

                <h3 className="mt-5 text-3xl font-semibold uppercase tracking-tight">
                  {item.title}
                </h3>

                <p className="mt-4 max-w-md text-sm leading-7 text-[#002950]/60">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="bg-[#EDEDE8] px-6 py-24 md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BD9655]">
              05 / O que fazemos
            </span>

            <h2 className="mt-7 text-5xl font-semibold uppercase leading-[1.02] tracking-tight md:text-7xl">
              Competências
              <br />
              que se complementam.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#002950]/60">
              Reunimos diferentes especialidades numa abordagem integrada,
              garantindo continuidade, coordenação e qualidade ao longo de
              todo o ciclo de vida dos projectos.
            </p>
          </div>

          <div className="mt-16 border-t border-[#002950]/20">
            {expertise.map((item) => (
              <article
                key={item.number}
                className="group grid gap-5 border-b border-[#002950]/20 py-9 transition-colors md:grid-cols-[80px_1fr_1fr] md:items-center md:py-12"
              >
                <span className="text-xs font-semibold tracking-widest text-[#BD9655]">
                  {item.number}
                </span>

                <h3 className="text-2xl font-semibold uppercase tracking-tight transition-transform duration-300 group-hover:translate-x-2 md:text-3xl">
                  {item.title}
                </h3>

                <p className="max-w-md text-sm leading-7 text-[#002950]/60">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="bg-[#002950] px-6 py-24 text-[#F7F7F5] md:px-12 md:py-32 lg:px-20">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BD9655]">
              PRO SOTA · Desde 1997
            </span>

            <h2 className="mt-8 text-5xl font-semibold uppercase leading-[0.98] tracking-tight md:text-7xl lg:text-8xl">
              O próximo
              <br />
              projecto começa
              <br />
              com uma ideia.
            </h2>
          </div>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-8 border-b border-[#BD9655] pb-4 text-sm font-semibold uppercase tracking-[0.15em] transition-colors hover:text-[#BD9655]"
          >
            Fale connosco
            <span className="text-xl">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
