
import type { Metadata } from "next";
import Link from "next/link";

import Nav from "../components/nav";
import Footer from "../components/footer";
import ContactCTA from "../components/contact_cta";
import { Reveal, Stagger, StaggerItem } from "../components/stagger";

export const metadata: Metadata = {
    title: "Pacotes de Serviços | PRO SOTA",
    description:
        "Conheça os pacotes PRO SOTA: manutenção e remodelação, assistência técnica emergencial e soluções completas de remodelação e construção.",
};

type Solution = {
    number: string;
    name: string;
    category: string;
    headline: string;
    description: string;
    audiences: string[];
    services: string[];
    visual: string;
    visualDescription: string;
    background: string;
    href: string;
    action: string;
};

const solutions: Solution[] = [
    {
        number: "01",
        name: "PACOTE 360°",
        category: "MANUTENÇÃO & REMODELAÇÃO",
        headline:
            "Cuidamos dos seus espaços. Preservamos e valorizamos o seu património.",
        description:
            "Uma solução destinada à manutenção preventiva e correctiva, bem como à remodelação de infraestruturas. Asseguramos melhores condições de conservação, segurança e funcionalidade dos imóveis através de serviços contínuos e programados.",
        audiences: [
            "Escolas e instituições de ensino",
            "Moradias",
            "Bancos e instituições financeiras",
            "Lojas e espaços comerciais",
        ],
        services: [
            "Manutenção preventiva",
            "Manutenção correctiva",
            "Inspecções técnicas",
            "Reparações programadas",
            "Remodelação de espaços",
            "Acompanhamento de instalações",
        ],
        visual: "360°",
        visualDescription: "CUIDAMOS DO SEU PATRIMÓNIO",
        background:
            "bg-[radial-gradient(circle_at_75%_25%,rgba(189,150,85,0.35),transparent_35%),linear-gradient(135deg,#002950,#06436b)]",
        href: "/contact?servico=pacote-360",
        action: "Solicitar uma proposta",
    },
    {
        number: "02",
        name: "PACOTE SOS",
        category: "ASSISTÊNCIA EMERGENCIAL",
        headline:
            "Surgiu um problema? A PRO SOTA está pronta para ajudar!",
        description:
            "Um serviço de assistência técnica destinado a moradias e prédios, com foco na resolução de avarias e situações emergenciais que exigem intervenção rápida e especializada.",
        audiences: [
            "Proprietários de moradias",
            "Condomínios",
            "Administradores de edifícios",
            "Inquilinos",
        ],
        services: [
            "Avarias eléctricas",
            "Problemas de canalização",
            "Fugas de água",
            "Infiltrações",
            "Reparações urgentes",
            "Intervenções técnicas em edifícios",
        ],
        visual: "SOS",
        visualDescription: "ASSISTÊNCIA TÉCNICA EMERGENCIAL",
        background:
            "bg-[radial-gradient(circle_at_20%_80%,rgba(189,150,85,0.3),transparent_40%),linear-gradient(135deg,#051221,#002950)]",
        href: "/contact?servico=pacote-sos",
        action: "Solicitar assistência",
    },
    {
        number: "03",
        name: "PACOTE CHAVE NA MÃO",
        category: "REMODELAÇÃO & CONSTRUÇÃO",
        headline:
            "Da transformação à construção, realizamos o seu projecto.",
        description:
            "Uma solução completa para a remodelação de casas existentes e construção de novas moradias desde a raiz. Integramos arquitectura, engenharia, execução de obras e acabamentos, de acordo com as necessidades de cada cliente.",
        audiences: [
            "Proprietários de imóveis",
            "Particulares",
            "Investidores imobiliários",
            "Promotores imobiliários",
        ],
        services: [
            "Remodelação integral de moradias",
            "Reabilitação e modernização de casas",
            "Construção de moradias desde a raiz",
            "Projectos de arquitectura e engenharia",
            "Execução e acompanhamento de obras",
            "Acabamentos e entrega do imóvel",
        ],
        visual: "PROJECTO.",
        visualDescription: "DA CONCEPÇÃO À ENTREGA",
        background:
            "bg-[radial-gradient(circle_at_80%_20%,rgba(189,150,85,0.4),transparent_38%),linear-gradient(135deg,#BD9655,#002950)]",
        href: "/contact?servico=chave-na-mao",
        action: "Falar sobre um projecto",
    },
];

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
                                        PRO SOTA · Pacotes de serviços
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
                                        A PRO SOTA disponibiliza três pacotes de serviços
                                        especializados, desenvolvidos para responder às
                                        necessidades de manutenção, assistência técnica,
                                        remodelação e construção. Escolha a solução adequada
                                        ao seu imóvel e às suas necessidades.
                                    </p>
                                </StaggerItem>
                            </div>
                        </Stagger>

                        {/* Solution navigation */}
                        <Stagger className="mt-16 grid grid-cols-1 border-t border-[#DCD9D0] sm:grid-cols-3">
                            {solutions.map((solution) => (
                                <StaggerItem key={solution.number}>
                                    <a
                                        href={`#solucao-${solution.number}`}
                                        className="group flex items-center justify-between border-b border-[#DCD9D0] py-5 transition-colors hover:text-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A2F] sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0"
                                    >
                                        <div>
                                            <span className="mb-2 block text-[10px] tracking-[0.15em] text-[#8B6A2F]">
                                                {solution.number}
                                            </span>
                                            <span className="font-heading text-xl font-medium">
                                                {solution.name}
                                            </span>
                                        </div>

                                        <span className="text-lg transition-transform duration-300 group-hover:translate-y-1">
                                            ↓
                                        </span>
                                    </a>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </section>

                {/* INTRODUCTION */}
                <section className="bg-white py-16 md:py-20">
                    <div className="mx-auto grid max-w-[1440px] gap-10 px-6 md:grid-cols-2 md:items-center md:px-10 lg:px-16">
                        <Reveal>
                            <span className="mb-5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BD9655]">
                                Os nossos pacotes de serviços
                            </span>

                            <h2 className="max-w-xl font-heading text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-[#002950] md:text-4xl">
                                Três soluções.
                                <br />
                                <span className="font-light text-[#BD9655]">
                                    Uma resposta completa.
                                </span>
                            </h2>
                        </Reveal>

                        <Reveal delay={0.15}>
                            <p className="max-w-xl text-sm leading-8 text-[#5F5B54] md:text-base">
                                Pode contar com a PRO SOTA para cuidar e valorizar
                                o seu imóvel, resolver uma situação urgente ou
                                transformar uma casa através de uma remodelação
                                integral ou de uma construção de raiz.
                            </p>
                        </Reveal>
                    </div>
                </section>

                {/* SOLUTION DETAILS */}
                {solutions.map((solution, index) => (
                    <section
                        key={solution.number}
                        id={`solucao-${solution.number}`}
                        className={`scroll-mt-20 border-t border-[#E6E4DE] ${
                            index % 2 === 1 ? "bg-white" : "bg-[#F3EFE6]"
                        }`}
                    >
                        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-16">
                            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
                                {/* Visual */}
                                <Reveal distance={30}>
                                    <div
                                        className={`group relative flex min-h-[300px] items-center justify-center overflow-hidden md:min-h-[380px] ${solution.background}`}
                                    >
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

                                        <span className="absolute left-7 top-7 text-[11px] tracking-[0.2em] text-white/60">
                                            {solution.number} / 03
                                        </span>

                                        <div className="relative text-center text-white transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                                            <span className="block font-heading text-[clamp(3.5rem,7vw,5.5rem)] font-medium leading-none tracking-[-0.07em]">
                                                {solution.visual}
                                            </span>

                                            <span className="mt-5 block text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                                                {solution.visualDescription}
                                            </span>
                                        </div>

                                        <span className="absolute bottom-7 right-7 text-[10px] font-semibold tracking-[0.2em] text-white/45">
                                            PRO SOTA
                                        </span>
                                    </div>
                                </Reveal>

                                {/* Information */}
                                <Stagger className="flex flex-col justify-center">
                                    <StaggerItem>
                                        <span className="mb-5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B6A2F]">
                                            {solution.category}
                                        </span>
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
                                                Principais serviços
                                            </h4>

                                            <ul className="grid gap-3 sm:grid-cols-2">
                                                {solution.services.map((service) => (
                                                    <li
                                                        key={service}
                                                        className="flex items-start gap-3 text-sm text-[#5F5B54]"
                                                    >
                                                        <span className="mt-1 text-[#BD9655]">
                                                            ↗
                                                        </span>
                                                        {service}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </StaggerItem>

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
                                Enquadramento comercial
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
                                            <th className="py-5 pr-6">Pacote</th>
                                            <th className="py-5 pr-6">Área de actuação</th>
                                            <th className="py-5">Público-alvo</th>
                                        </tr>
                                    </thead>

                                    <tbody className="text-sm text-[#5F5B54]">
                                        <tr className="border-b border-[#E6E4DE]">
                                            <td className="py-6 pr-6 font-semibold text-[#002950]">
                                                360°
                                            </td>
                                            <td className="py-6 pr-6">
                                                Manutenção e Remodelação
                                            </td>
                                            <td className="py-6">
                                                Escolas, moradias, bancos e lojas
                                            </td>
                                        </tr>

                                        <tr className="border-b border-[#E6E4DE]">
                                            <td className="py-6 pr-6 font-semibold text-[#002950]">
                                                SOS
                                            </td>
                                            <td className="py-6 pr-6">
                                                Assistência Emergencial
                                            </td>
                                            <td className="py-6">
                                                Moradias e prédios
                                            </td>
                                        </tr>

                                        <tr className="border-b border-[#E6E4DE]">
                                            <td className="py-6 pr-6 font-semibold text-[#002950]">
                                                Chave na Mão
                                            </td>
                                            <td className="py-6 pr-6">
                                                Remodelação e Construção
                                            </td>
                                            <td className="py-6">
                                                Proprietários e investidores imobiliários
                                            </td>
                                        </tr>
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
