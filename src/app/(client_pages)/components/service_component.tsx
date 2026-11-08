import Link from "next/link";

export default function ServicesSection({ services, Routes }: { services: any[], Routes: any }) {
    const wrap = "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";

    return (
        <section
            id="servicos"
            className="scroll-mt-24 bg-[#f3efe6] py-24 text-[#002950] md:py-32 lg:py-26"
        >
            <div className={wrap}>
                {/* HEADER */}
                <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
                    <div>
                        <div className="mb-8 flex items-center gap-4">
                            <span className="h-px w-10 bg-[#BD9655]" />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#002950]/60 md:text-xs">
                                O que fazemos
                            </p>
                        </div>

                        <h2 className="max-w-xl text-[clamp(2.4rem,4.8vw,4.75rem)] font-medium leading-[1] tracking-[-0.06em] text-[#002950]">
                            Quatro áreas,
                            <br />
                            <span>uma só visão</span>
                        </h2>
                    </div>

                    <p className="max-w-xl text-sm leading-7 text-[#5F656A] md:text-base lg:pb-2">
                        Soluções integradas para acompanhar todas as etapas do seu
                        projecto, da concepção à execução.
                    </p>
                </div>

                {/* LIST */}
                <div className="mt-16 border-t border-[#002950]/15">
                    {services.map((service, index) => (
                        <details
                            key={service.key}
                            name="servicos"
                            open={index === 0}
                            className="group border-b border-[#002950]/15"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 focus-visible:outline-2 md:py-7 [&::-webkit-details-marker]:hidden">
                                <div className="flex items-center gap-5 md:gap-8">
                                    <span className="text-xs font-medium text-[#17497c] md:text-sm">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-xl font-medium tracking-tight text-[#0c3a68] md:text-3xl">
                                        {service.title}
                                    </span>
                                </div>

                                <span
                                    aria-hidden="true"
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#002950]/25 text-xl transition duration-300 group-open:rotate-45 group-open:border-gold"
                                >
                                    +
                                </span>
                            </summary>

                            <div className="grid gap-6 pb-8 pl-9 md:grid-cols-[0.8fr_1.2fr] md:gap-12 md:pl-[4.25rem]">
                                <p className="max-w-sm text-sm leading-7 text-[#5F656A] md:text-base">
                                    {service.intro ?? service.label}
                                </p>

                                <ul className="max-w-xl space-y-3">
                                    {service.items.map(([title]: string) => (
                                        <li
                                            key={title}
                                            className="flex items-center gap-3 border-b border-[#002950]/10 pb-3 text-sm text-[#5F656A]"
                                        >
                                            <span className="h-px w-4 shrink-0 bg-gold" aria-hidden="true" />
                                            {title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </details>
                    ))}
                </div>

                <Link
                    href={Routes.services}
                    className="mt-10 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wider underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold"
                >
                    Explorar todos os serviços
                    <span aria-hidden="true">↗</span>
                </Link>
            </div>
        </section>

    )
}