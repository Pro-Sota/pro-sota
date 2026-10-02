import {
    CalendarDays,
    Clock3,
    ListTodo,
    TriangleAlert,
} from "lucide-react";

type Props = {
    monthCount: number;
    todayCount: number;
    nextSevenDaysCount: number;
    upcomingDeadlinesCount: number;
};

export default function CalendarStats({
    monthCount,
    todayCount,
    nextSevenDaysCount,
    upcomingDeadlinesCount,
}: Props) {
    const stats = [
        {
            label: "Este mês",
            value: monthCount,
            icon: CalendarDays,
        },
        {
            label: "Hoje",
            value: todayCount,
            icon: Clock3,
        },
        {
            label: "Próximos 7 dias",
            value: nextSevenDaysCount,
            icon: ListTodo,
        },
        {
            label: "Prazos próximos",
            value: upcomingDeadlinesCount,
            icon: TriangleAlert,
            danger: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        className="flex h-full items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-4 sm:p-5"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm text-black/50">
                                {stat.label}
                            </p>

                            <p
                                className={[
                                    "mt-1.5 text-2xl font-semibold tracking-tight",
                                    stat.danger
                                        ? "text-red-600"
                                        : "text-[#002950]",
                                ].join(" ")}
                            >
                                {stat.value}
                            </p>
                        </div>

                        <div
                            className={[
                                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                                stat.danger
                                    ? "bg-red-50"
                                    : "bg-[#F7F7F5]",
                            ].join(" ")}
                        >
                            <Icon
                                size={18}
                                strokeWidth={1.8}
                                className={
                                    stat.danger
                                        ? "text-red-500"
                                        : "text-[#002950]"
                                }
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}