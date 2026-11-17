
/*
 * Apresentação institucional e indicadores editoriais.
 * Server Component — Next.js App Router.
 */

import Link from "next/link";

import { site } from "../content/site";
import { projectsCount, expertise } from "../content/about";

const currentYear = new Date().getFullYear();
const years = Math.max(1, currentYear - site.founded);

const stats = [
  {
    value: projectsCount,
    label: "Projectos e obras acabadas",
    index: "01",
  },
  {
    value: `${years}+`,
    label: "Anos de experiência",
    index: "02",
  },
  {
    value: "98%",
    label: "Taxa de entrega dentro do prazo",
    index: "03",
  },
  {
    value: expertise.length,
    label: "Áreas de especialidade",
    index: "04",
  },
];

export default function About() {
  return (
    <section
      id="sobre"
      aria-labelledby="about-title"
      className="relative overflow-hidden bg-paper py-20 text-ink sm:py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12">
        {/* Introduction */}
        <div className="grid grid-cols-1 items-end gap-8 border-b border-ink/15 pb-10 sm:pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dim sm:text-[11px]">
              <span className="h-px w-7 bg-gold" aria-hidden="true" />
              Apresentação
            </p>

            <h2
              id="about-title"
              className="max-w-[18ch] text-[clamp(2.5rem,4.2vw,3.75rem)] font-bold uppercase leading-[0.98] tracking-[-0.035em] text-ink"
            >
              Confiança, funcionalidade e valor{" "}
              <em className="not-italic text-ink">duradouro.</em>
            </h2>
          </div>

          <p className="max-w-[570px] text-base leading-[1.85] text-ink-soft sm:text-[17px] lg:justify-self-end lg:pb-1">
            A PRO SOTA assenta numa base sólida de conhecimento técnico e
            prática consolidada ao longo de mais de{" "}
            <strong className="font-semibold text-ink">
              {years} anos de experiência
            </strong>{" "}
            no sector da arquitectura e construção — do planeamento
            arquitectónico à execução rigorosa da obra.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 border-b border-ink/15 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.index}
              className={[
                "flex min-h-[150px] flex-col justify-between py-7 sm:min-h-[175px] sm:py-8",
                "border-ink/15",
                index % 2 === 1 ? "border-l pl-5 sm:pl-7" : "pr-5 sm:pr-7",
                index >= 2 ? "border-t sm:border-t-0" : "",
                index > 0 ? "sm:border-l sm:pl-7" : "",
              ].join(" ")}
            >
              <span className="text-[10px] font-medium tracking-[0.16em] text-ink-soft">
                {stat.index}
              </span>

              <div className="mt-6">
                <b className="block font-display text-[clamp(2.5rem,4vw,3.5rem)] font-semibold leading-none tracking-tight text-navy">
                  {stat.value}
                </b>

                <span className="mt-3 block max-w-[17ch] text-[11px] leading-[1.6] text-ink-soft sm:text-xs">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional statement */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-20">
          <div className="relative">
            <span
              className="mb-3 block font-display text-6xl leading-[0.7] text-gold"
              aria-hidden="true"
            >
              "
            </span>

            <p className="max-w-[460px] text-[clamp(1.5rem,2.5vw,2.15rem)] font-medium leading-[1.25] tracking-[-0.025em] text-ink">
              Não entregamos apenas projectos — entregamos confiança,
              funcionalidade e valor duradouro.
            </p>
          </div>

          <div className="grid grid-cols-1 content-center gap-6 text-sm leading-[1.9] text-ink-soft sm:grid-cols-2 sm:gap-8 sm:text-[15px]">
            <p>
              Somos uma empresa angolana especializada em arquitectura,
              engenharia, construção e fiscalização, comprometida com a
              excelência técnica, a estética contemporânea e o cumprimento
              dos prazos. A nossa abordagem é centrada no cliente: ouvimos,
              compreendemos, propomos soluções e executamos com rigor.
            </p>

            <p>
              Cada projecto é desenvolvido com cuidado e atenção ao detalhe,
              procurando transformar as ideias dos nossos clientes em
              soluções funcionais, tecnicamente fundamentadas e executadas
              segundo elevados padrões de qualidade.
            </p>
          </div>
        </div>

        {/* Sign-off */}
        <div className="flex flex-col gap-5 border-t border-ink/15 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <b className="text-sm font-semibold tracking-wide text-ink">
              Arquitecto Társis Soma
            </b>

            <span className="text-xs text-ink-soft">
              Responsável técnico, PRO SOTA
            </span>
          </div>

          <Link
            href="mailto:geral@prosota.ao"
            className="w-fit border-b border-gold pb-1 text-xs font-semibold tracking-wide text-navy transition-colors duration-300 hover:text-gold-dim focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            geral@prosota.ao
          </Link>
        </div>
      </div>
    </section>
  );
}
