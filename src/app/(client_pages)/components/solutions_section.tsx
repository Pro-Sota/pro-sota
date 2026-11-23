
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { SOLUTIONS } from "../solutions/solutions_data";
import SolutionCard from "./solution_card";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const HEADER_VARIANTS = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.14,
            delayChildren: 0.08,
        },
    },
};

const ITEM_VARIANTS = {
    hidden: {
        opacity: 0,
        y: 22,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.75,
            ease: EASE_OUT,
        },
    },
};

const GRID_VARIANTS = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.1,
        },
    },
};

export default function SolutionsSection() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section
            id="solucoes"
            aria-labelledby="solutions-title"
            className="relative overflow-hidden bg-[#F3EFE6] py-20 text-[#1F1E1B] md:py-24"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">

                {/* Section heading */}
                <motion.div
                    variants={HEADER_VARIANTS}
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-12 grid gap-7 lg:mb-16 lg:grid-cols-[1fr_0.65fr] lg:items-end"
                >
                    <div>
                        <motion.span
                            variants={ITEM_VARIANTS}
                            className="mb-5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6A2F]"
                        >
                            Soluções PRO SOTA
                        </motion.span>

                        <motion.h2
                            variants={ITEM_VARIANTS}
                            id="solutions-title"
                            className="max-w-3xl font-heading text-[clamp(2.25rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#1F1E1B]"
                        >
                            O que precisa.
                            <br />
                            <span className="font-light text-[#BD9655]">
                                A solução certa.
                            </span>
                        </motion.h2>
                    </div>

                    <motion.p
                        variants={ITEM_VARIANTS}
                        className="max-w-lg text-sm leading-7 text-[#5F5B54] md:text-base"
                    >
                        Da gestão e manutenção de imóveis à construção e
                        remodelação, reunimos soluções para acompanhar
                        diferentes necessidades.
                    </motion.p>
                </motion.div>

                {/* Solution cards */}
                <motion.div
                    variants={GRID_VARIANTS}
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.12 }}
                    className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                    {SOLUTIONS.map((solution, index) => (
                        <motion.div
                            key={solution.id}
                            variants={ITEM_VARIANTS}
                            className="h-full"
                        >
                            <SolutionCard
                                solution={solution}
                                index={index}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Explore all solutions */}
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                        duration: 0.7,
                        delay: 0.15,
                        ease: EASE_OUT,
                    }}
                    className="mt-12 flex justify-start border-t border-[#D8D1C4] pt-7 md:mt-14 md:justify-end"
                >
                    <Link
                        href="/solutions"
                        className="group inline-flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#002950] transition-colors hover:text-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A2F]"
                    >
                        Explorar todas as soluções

                        <span
                            aria-hidden="true"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D1C4] transition-all duration-300 group-hover:border-[#BD9655] group-hover:bg-[#BD9655] group-hover:text-white"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                            >
                                <path
                                    d="M5 12h14m-6-6 6 6-6 6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
