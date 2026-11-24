
import Image from "next/image";
import Link from "next/link";

import type { Solution } from "../solutions/solutions_data";
import { ArrowUpRight } from "lucide-react";

type SolutionCardProps = {
    solution: Solution;
    index: number;
};

export default function SolutionCard({
    solution,
}: SolutionCardProps) {
    const {
        name,
        category,
        description,
        slug,
        image,
    } = solution;

    // Link to the corresponding section on the dedicated Solutions page.
    const detailsHref = `/solutions#${slug}`;

    return (
        <article className="group relative flex h-full min-w-0 flex-col">

            {/* Image */}
            <Link
                href={detailsHref}
                aria-label={`Conhecer ${name}`}
                className="relative mb-6 block aspect-[5/4] overflow-hidden bg-[#002950] outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-4"
            >
                <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />

                {/* Image overlay */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#002950]/65 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90"
                />

                {/* Development status */}
                {solution.name === "SOS Casas" && (
                    <span className="absolute left-5 top-5 border border-white/30 bg-[#002950]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                        Em desenvolvimento
                    </span>
                )}

                {/* Image arrow */}
                <span
                    aria-hidden="true"
                    className="absolute bottom-5 right-5 flex size-10 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-300 group-hover:border-[#BD9655] group-hover:bg-[#BD9655]"
                >
                    <ArrowUpRight
                        size={17}
                        strokeWidth={1.5}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </span>
            </Link>

            {/* Category */}
            <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B6A2F]">
                {category}
            </span>

            {/* Title */}
            <h3 className="font-heading text-[clamp(1.7rem,2.5vw,2.2rem)] font-medium leading-[1.1] tracking-[-0.045em] text-[#002950] ">
                <Link
                    href={detailsHref}
                    className="outline-none focus-visible:underline"
                >
                    {name}
                </Link>
            </h3>

            {/* Short description */}
            <p className="mt-3 max-w-md line-clamp-3 text-[13px] leading-[1.85] text-[#68635B] md:text-sm">
                {description}
            </p>

            {/* Action */}
            <div className="mt-auto flex items-center gap-3 pt-6">
                <Link
                    href={detailsHref}
                    className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#002950] transition-colors hover:text-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A2F]"
                >
                    Conhecer solução

                    <span
                        aria-hidden="true"
                        className="text-base transition-transform duration-300 group-hover:translate-x-1"
                    >
                        →
                    </span>
                </Link>
            </div>
        </article>
    );
}
