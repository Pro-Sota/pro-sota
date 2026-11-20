
"use client";

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
            className="relative overflow-hidden bg-[#F3EFE6] py-20 text-[#1F1E1B]"
        >
            <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16">
                {/* Section heading */}
                <motion.div
                    variants={HEADER_VARIANTS}
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-14 grid gap-7 lg:mb-20 lg:grid-cols-[1fr_0.65fr] lg:items-end"
                >
                    <div>
                        <motion.span
                            variants={ITEM_VARIANTS}
                            className="mb-5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6A2F]"
                        >
                            Para além dos serviços
                        </motion.span>

                        <motion.h2
                            variants={ITEM_VARIANTS}
                            id="solutions-title"
                            className="max-w-3xl font-heading text-[clamp(2.25rem,4.5vw,4rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#1F1E1B]"
                        >
                            Soluções para
                            <br />
                            <span className="font-light text-[#BD9655]">
                                cada necessidade.
                            </span>
                        </motion.h2>
                    </div>

                    <motion.p
                        variants={ITEM_VARIANTS}
                        className="max-w-lg text-sm leading-7 text-[#5F5B54] md:text-base"
                    >
                        Da manutenção de imóveis à concretização de grandes projectos,
                        desenvolvemos soluções que respondem aos diferentes desafios
                        dos nossos clientes.
                    </motion.p>
                </motion.div>

                {/* Solution cards */}
                <motion.div
                    variants={GRID_VARIANTS}
                    initial={shouldReduceMotion ? false : "hidden"}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.12 }}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                >
                    {SOLUTIONS.map((solution, index) => (
                        <motion.div
                            key={solution.id}
                            variants={ITEM_VARIANTS}
                        >
                            <SolutionCard
                                solution={solution}
                                index={index}
                                total={SOLUTIONS.length}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
