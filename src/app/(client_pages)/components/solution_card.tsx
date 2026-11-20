import Image from "next/image";
import Link from "next/link";
import type { Solution } from "../solutions/solutions_data";

type SolutionCardProps = {
    solution: Solution;
    index: number;
    total: number;
};

export default function SolutionCard({ solution }: SolutionCardProps) {
    const {
        name,
        category,
        description,
        tags,
        href,
        action,
        image,
        comingSoon,
    } = solution;

    return (
        <article className="group relative flex min-w-0 flex-col border-t border-[#D8D1C4] py-7 transition-colors duration-300 hover:border-[#BD9655] md:py-9">
            {/* Image (decorative: the title already names the solution) */}
            <div className="relative mb-7 aspect-[4/3] overflow-hidden bg-[#1F1E1B]">
                <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
            </div>

            {/* Top metadata */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B6A2F]">
                    {category}
                </span>

                {comingSoon && (
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#89847B]">
                        Em desenvolvimento
                    </span>
                )}
            </div>

            {/* Title */}
            <h3 className="max-w-md font-heading text-[clamp(1.7rem,2.5vw,2.2rem)] font-medium leading-[1.1] tracking-[-0.045em] text-[#1F1E1B]">
                <Link
                    href={href}
                    className="outline-none transition-colors duration-300 hover:text-[#8B6A2F] focus-visible:text-[#8B6A2F] after:absolute after:inset-0 after:z-10 after:content-['']"
                >
                    {name}
                </Link>
            </h3>

            {/* Description */}
            <p className="mt-4 max-w-md text-[13px] leading-[1.9] text-[#68635B] md:text-sm">
                {description}
            </p>

            {/* Tags */}
            <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-2" aria-label="Âmbito">
                {tags.map((tag) => (
                    <li
                        key={tag}
                        className="border border-[#E3DED4] px-2.5 py-1.5 text-[10px] tracking-wide text-[#68635B]"
                    >
                        {tag}
                    </li>
                ))}
            </ul>

            {/* Action */}
            <div className="mt-auto flex items-center justify-between pt-9">
                <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#1F1E1B] transition-colors duration-300 group-hover:text-[#8B6A2F]">
                    {action}
                </span>

                <span
                    aria-hidden="true"
                    className="relative z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D8D1C4] transition-[background-color,border-color,color] duration-300 group-hover:border-[#BD9655] group-hover:bg-[#BD9655] group-hover:text-white"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                    >
                        <path
                            d="M7 17 17 7M7 7h10v10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </div>
        </article>
    );
}