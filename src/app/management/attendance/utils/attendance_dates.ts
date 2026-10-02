    const monthFormatter = new Intl.DateTimeFormat("pt-PT", {
        month: "long",
        year: "numeric",
    });

    const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
    });

    export function getTodayDate(): string {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: "Africa/Luanda",
        }).format(new Date());
    }

    export function getInitials(
        firstName: string,
        lastName: string,
    ): string {
        return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
            .toUpperCase()
            .trim();
    }

    export function formatTime(
        value: string | null,
    ): string {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return timeFormatter.format(date);
    }

    export function formatDate(date: string): string {
        const parsed = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return dateFormatter.format(parsed);
    }

    export function getMonthLabel(month: string): string {
        const [year, monthNumber] = month.split("-").map(Number);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(monthNumber)
        ) {
            return month;
        }

        const date = new Date(
            year,
            monthNumber - 1,
            1,
        );

        return monthFormatter
            .format(date)
            .replace(/^./, (char) => char.toUpperCase());
    }

    export function getMonthDays(
        month: string,
    ): string[] {
        const [year, monthNumber] = month
            .split("-")
            .map(Number);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(monthNumber) ||
            monthNumber < 1 ||
            monthNumber > 12
        ) {
            return [];
        }

        const daysInMonth = new Date(
            year,
            monthNumber,
            0,
        ).getDate();

        return Array.from(
            { length: daysInMonth },
            (_, index) =>
                `${year}-${String(monthNumber).padStart(2, "0")}-${String(
                    index + 1,
                ).padStart(2, "0")}`,
        );
    }

    export function getPreviousMonth(
        month: string,
    ): string {
        const [year, monthNumber] = month
            .split("-")
            .map(Number);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(monthNumber)
        ) {
            return month;
        }

        const date = new Date(
            year,
            monthNumber - 2,
            1,
        );

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1,
        ).padStart(2, "0")}`;
    }

    export function getNextMonth(
        month: string,
    ): string {
        const [year, monthNumber] = month
            .split("-")
            .map(Number);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(monthNumber)
        ) {
            return month;
        }

        const date = new Date(
            year,
            monthNumber,
            1,
        );

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1,
        ).padStart(2, "0")}`;
    }

    export function isWeekend(date: string): boolean {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return false;
    }

    const day = parsed.getDay();

    return day === 0 || day === 6;
}

export function isFutureDate(date: string): boolean {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return false;
    }

    const today = new Date(
        `${getTodayDate()}T00:00:00`,
    );

    return parsed > today;
}
