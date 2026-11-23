
import type { Metadata } from "next";
import Link from "next/link";

import Nav from "../components/nav";
import Footer from "../components/footer";
import ContactCTA from "../components/contact_cta";
import { Reveal, Stagger, StaggerItem } from "../components/stagger";

import { SOLUTIONS } from "./solutions_data";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Pacotes de Serviços | PRO SOTA",
    description:
        "Conheça as soluções PRO SOTA: gestão e manutenção de imóveis, assistência residencial SOS Casas e projectos completos de remodelação e construção.",
};

function ArrowIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        >
            <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function SolutionsPage() {
    return (
        <>
            <Nav />

            <main className="overflow-hidden bg-[#F7F7F5] text-[#002950]">

                {/* HERO */}
                <section className="relative isolate overflow-hidden border-b border-[#E6E4DE]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10"
                    >
                        <div className="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full border border-[#BD9655]/15" />
                        <div className="absolute -right-16 -top-24 h-[380px] w-[380px] rounded-full border border-[#BD9655]/20" />
                        <div className="absolute right-0 top-0 h-full w-[42%] bg-[radial-gradient(ellipse_at_70%_35%,rgba(189,150,85,0.10),transparent_65%)]" />
                        <div className="absolute bottom-0 left-0 h-px w-1/3 bg-gradient-to-r from-[#BD9655]/50 to-transparent" />
                    </div>

                    <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-24 md:px-10 md:pb-20 md:pt-32 lg:px-16">
                        <Stagger className="relative max-w-5xl">
                            <StaggerItem>
                                <div className="mb-7 flex items-center gap-4">
                                    <span className="h-px w-9 bg-[#BD9655]" />
                                    <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8B6A2F]">
                                        PRO SOTA · Soluções
                                    </span>
                                </div>
                            </StaggerItem>

                            <StaggerItem>
                                <h1 className="max-w-4xl font-heading text-[clamp(2.5rem,5vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#1F1E1B]">
                                    Diferentes desafios.
                                    <br />
                                    <span className="relative inline-block font-light text-[#BD9655]">
                                        Soluções integradas.
                                        <span
                                            aria-hidden="true"
                                            className="absolute -bottom-2 left-1 h-[3px] w-16 bg-[#BD9655]/70"
                                        />
                                    </span>
                                </h1>
                            </StaggerItem>

                            <div className="mt-10">
                                <StaggerItem>
                                    <p className="max-w-2xl text-base leading-8 text-[#5F5B54] md:text-lg">
                                        A PRO SOTA disponibiliza três soluções complementares,
                                        desenvolvidas para responder às necessidades de gestão
                                        e manutenção de imóveis, assistência residencial e
                                        execução de projectos de remodelação e construção.
                                    </p>
                                </StaggerItem>
                            </div>
                        </Stagger>
                    </div>
                </section>

                {/* INTRODUCTION */}
                <section className="bg-white py-16 md:py-20">
                    <div className="mx-auto grid max-w-[1440px] gap-10 px-6 md:grid-cols-2 md:items-center md:px-10 lg:px-16">
                        <Reveal>
                            <span className="mb-5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BD9655]">
                                As soluções PRO SOTA
                            </span>

                            <h2 className="max-w-xl font-heading text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-[#002950] md:text-4xl">
                                Três soluções.
                                <br />
                                <span className="font-light text-[#BD9655]">
                                    Um compromisso.
                                </span>
                            </h2>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <p className="max-w-xl text-sm leading-8 text-[#5F5B54] md:text-base">
                                Seja para cuidar de um imóvel, resolver uma emergência
                                residencial ou concretizar um projecto de construção,
                                a PRO SOTA disponibiliza soluções que combinam
                                conhecimento técnico, acompanhamento e qualidade
                                de execução.
                            </p>
                        </Reveal>
                    </div>
                </section>

                {/* SOLUTION DETAILS */}
                {SOLUTIONS.map((solution, index) => (
                    <section
                        key={solution.id}
                        id={`${solution.slug}`}
                        className={`scroll-mt-20 border-t border-[#E6E4DE] ${index % 2 === 1 ? "bg-white" : "bg-[#F3EFE6]"
                            }`}
                    >
                        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-16">
                            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">

                                {/* Visual */}
                                <Reveal distance={30}>
                                    <div
                                        className={`group relative min-h-[300px] overflow-hidden md:min-h-[380px] ${solution.visual.gradient}`}
                                    >
                                        {/* Decorative circles */}
                                        <div
                                            aria-hidden="true"
                                            className="absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/20"
                                        />

                                        <div
                                            aria-hidden="true"
                                            className="absolute -right-12 -top-12 h-72 w-72 rounded-full border border-white/20"
                                        />

                                        <div
                                            aria-hidden="true"
                                            className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/20"
                                        />

                                        {solution.image ? (
                                            <Image
                                                src={solution.image}
                                                alt=""
                                                fill
                                                aria-hidden="true"
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                            />
                                        ) : (
                                            <div className="relative text-center text-white">
                                                <span className="block font-heading text-[clamp(3.5rem,7vw,5.5rem)] font-medium leading-none tracking-[-0.07em]">
                                                    {solution.visual.title}
                                                </span>
                                                <span className="mt-5 block text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                                                    {solution.visual.subtitle}
                                                </span>
                                            </div>
                                        )}

                                        {solution.status === "development" && (
                                            <span className="absolute left-6 top-6 border border-white/30 bg-[#002950]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
                                                Em desenvolvimento
                                            </span>
                                        )}

                                        <span className="absolute bottom-7 right-7 text-[10px] font-semibold tracking-[0.2em] text-white/60">
                                            PRO SOTA
                                        </span>
                                    </div>
                                </Reveal>

                                {/* Information */}
                                <Stagger className="flex flex-col justify-center">
                                    <StaggerItem>
                                        <div className="mb-5 flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B6A2F]">
                                                {solution.category}
                                            </span>

                                            {solution.status === "development" && (
                                                <span className="border border-[#BD9655]/40 bg-[#BD9655]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8B6A2F]">
                                                    Em desenvolvimento
                                                </span>
                                            )}
                                        </div>
                                    </StaggerItem>

                                    <StaggerItem>
                                        <h2 className="max-w-2xl font-heading text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-[1.04] tracking-[-0.04em] text-[#002950]">
                                            {solution.name}
                                        </h2>
                                    </StaggerItem>

                                    <StaggerItem>
                                        <h3 className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-[#002950] md:text-xl">
                                            {solution.headline}
                                        </h3>
                                    </StaggerItem>

                                    <StaggerItem>
                                        <p className="mt-4 max-w-xl text-sm leading-7 text-[#5F5B54]">
                                            {solution.description}
                                        </p>
                                    </StaggerItem>

                                    {/* SOS Casas response information */}
                                    {solution.id === "sos-casas" && (
                                        <StaggerItem>
                                            <div className="mt-6 flex gap-4 border-l-2 border-[#BD9655] bg-white/70 px-5 py-4">
                                                <span
                                                    aria-hidden="true"
                                                    className="font-heading text-2xl text-[#BD9655]"
                                                >
                                                    24
                                                </span>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#002950]">
                                                        Resposta no próprio dia ou no dia seguinte
                                                    </p>
                                                    <p className="mt-1 text-xs leading-6 text-[#5F5B54]">
                                                        O prazo previsto depende da hora em que o pedido
                                                        for submetido e da disponibilidade operacional.
                                                    </p>
                                                </div>
                                            </div>
                                        </StaggerItem>
                                    )}

                                    {/* Target audience */}
                                    <StaggerItem>
                                        <div className="mt-9">
                                            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#002950]">
                                                Público-alvo
                                            </h4>

                                            <div className="flex flex-wrap gap-2">
                                                {solution.audiences.map((audience) => (
                                                    <span
                                                        key={audience}
                                                        className="border border-[#E6E4DE] bg-white px-3 py-2 text-xs text-[#5F5B54]"
                                                    >
                                                        {audience}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </StaggerItem>

                                    {/* Services */}
                                    <StaggerItem>
                                        <div className="mt-8">
                                            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#002950]">
                                                {solution.id === "sos-casas"
                                                    ? "Principais funcionalidades e serviços"
                                                    : "Principais serviços"}
                                            </h4>

                                            <ul className="grid gap-3 sm:grid-cols-2">
                                                {solution.services.map((service) => (
                                                    <li
                                                        key={service}
                                                        className="flex items-start gap-3 text-sm text-[#5F5B54]"
                                                    >
                                                        <span
                                                            aria-hidden="true"
                                                            className="mt-0.5 text-[#BD9655]"
                                                        >
                                                            ↗
                                                        </span>
                                                        {service}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </StaggerItem>

                                    {/* CTA */}
                                    <StaggerItem>
                                        <div className="mt-10">
                                            <Link
                                                href={solution.href}
                                                className="group inline-flex items-center gap-4 bg-[#002950] px-7 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A2F]"
                                            >
                                                {solution.action}
                                                <ArrowIcon />
                                            </Link>
                                        </div>
                                    </StaggerItem>
                                </Stagger>
                            </div>
                        </div>
                    </section>
                ))}

                {/* COMMERCIAL SEGMENTATION */}
                <section className="border-t border-[#E6E4DE] bg-white py-16 md:py-20">
                    <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
                        <Reveal>
                            <span className="mb-5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BD9655]">
                                Enquadramento das soluções
                            </span>

                            <h2 className="max-w-2xl font-heading text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-[#002950] md:text-4xl">
                                A solução certa para
                                <br />
                                <span className="font-light text-[#BD9655]">
                                    cada necessidade.
                                </span>
                            </h2>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <div className="mt-12 overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse text-left">
                                    <thead>
                                        <tr className="border-y border-[#DCD9D0] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B6A2F]">
                                            <th className="py-5 pr-6">Solução</th>
                                            <th className="py-5 pr-6">Área de actuação</th>
                                            <th className="py-5">Público-alvo</th>
                                        </tr>
                                    </thead>

                                    <tbody className="text-sm text-[#5F5B54]">
                                        {SOLUTIONS.map((solution) => (
                                            <tr
                                                key={solution.id}
                                                className="border-b border-[#E6E4DE]"
                                            >
                                                <td className="py-6 pr-6">
                                                    <div className="font-semibold text-[#002950]">
                                                        {solution.name}
                                                    </div>
                                                    {solution.status === "development" && (
                                                        <span className="mt-1 inline-block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8B6A2F]">
                                                            Em desenvolvimento
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-6 pr-6">
                                                    {solution.category}
                                                </td>

                                                <td className="py-6">
                                                    {solution.audiences
                                                        .slice(0, 3)
                                                        .join(", ")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* INSTITUTIONAL SIGNATURE */}
                <section className="relative overflow-hidden border-t border-white/10 bg-[#002950] px-6 py-16 text-[#F7F7F5] md:px-10 md:py-20 lg:px-16">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-[#BD9655]/10"
                    />

                    <div className="relative mx-auto max-w-[1440px]">
                        <Reveal>
                            <span className="mb-6 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#BD9655]">
                                PRO SOTA · O nosso compromisso
                            </span>

                            <h2 className="max-w-4xl font-heading text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.045em]">
                                Construímos, remodelamos
                                <br />
                                <span className="font-light text-[#BD9655]">
                                    e cuidamos do seu património.
                                </span>
                            </h2>
                        </Reveal>
                    </div>
                </section>

                {/* CONTACT */}
                <Reveal className="mb-20">
                    <ContactCTA />
                </Reveal>
            </main>
        </>
    );
}
