type Props = {
    weekLabel: string;
    eventCount: number;
    projectCount: number;
};

export default function WeeklySummary({
    weekLabel,
    eventCount,
    projectCount,
}: Props) {
    const stats = [
        { value: eventCount, label: "eventos" },
        { value: projectCount, label: "projectos" },
    ];

    return (
        <section className="flex h-full flex-col justify-between gap-5 rounded-2xl bg-[#002950] p-5 text-white sm:p-6">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
                    Esta semana
                </p>

                <h2 className="mt-1.5 text-base font-semibold">
                    {weekLabel}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl bg-white/[0.06] px-4 py-3"
                    >
                        <p className="text-2xl font-semibold tracking-tight">
                            {stat.value}
                        </p>

                        <p className="mt-0.5 text-xs text-white/50">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}