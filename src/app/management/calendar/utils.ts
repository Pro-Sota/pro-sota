export function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
    return new Date(`${dateKey}T12:00:00`);
}

export function getCalendarDays(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay();

    // Monday-first calendar.
    startDay = startDay === 0 ? 6 : startDay - 1;

    const totalDays = lastDay.getDate();
    const days: Date[] = [];

    for (let i = 0; i < startDay; i++) {
        days.push(
            new Date(
                year,
                month,
                -startDay + i + 1,
            ),
        );
    }

    for (let day = 1; day <= totalDays; day++) {
        days.push(new Date(year, month, day));
    }

    while (days.length < 42) {
        const nextDay =
            days.length - startDay - totalDays + 1;

        days.push(
            new Date(
                year,
                month + 1,
                nextDay,
            ),
        );
    }

    return days;
}