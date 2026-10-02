import Attendance from "./attendance";
import {
    getAttendanceProfiles,
    getAttendanceByDate,
    getAttendanceByMonth,
    registerCheckIn,
    registerCheckOut,
    registerLate,
    registerAbsent,
    type AttendanceWithProfile,
} from "@/services/attendance";

type AttendancePageProps = {
    searchParams: Promise<{
        view?: "day" | "month";
        date?: string;
        month?: string;
    }>;
};

function getLuandaToday(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Luanda",
    }).format(new Date());
}

function getCurrentMonth(): string {
    return getLuandaToday().slice(0, 7);
}

function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(
        year,
        month - 1,
        day,
    );

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function isValidMonth(value: string): boolean {
    if (!/^\d{4}-\d{2}$/.test(value)) {
        return false;
    }

    const [, month] = value.split("-").map(Number);

    return month >= 1 && month <= 12;
}

function getMonthRange(month: string) {
    if (!isValidMonth(month)) {
        return getMonthRange(getCurrentMonth());
    }

    const [year, monthNumber] = month
        .split("-")
        .map(Number);

    const start = `${year}-${String(monthNumber).padStart(
        2,
        "0",
    )}-01`;

    const lastDay = new Date(
        year,
        monthNumber,
        0,
    ).getDate();

    const end = `${year}-${String(monthNumber).padStart(
        2,
        "0",
    )}-${String(lastDay).padStart(2, "0")}`;

    return {
        start,
        end,
    };
}

async function handleCheckIn(profileId: string) {
    "use server";

    await registerCheckIn(profileId);
}

async function handleCheckOut(profileId: string) {
    "use server";

    await registerCheckOut(profileId);
}

async function handleMarkLate(profileId: string) {
    "use server";

    await registerLate(profileId);
}

async function handleMarkAbsent(profileId: string) {
    "use server";

    await registerAbsent(profileId);
}

export default async function AttendancePage({
    searchParams,
}: AttendancePageProps) {
    const params = await searchParams;

    const today = getLuandaToday();
    const currentMonth = today.slice(0, 7);

    const view =
        params.view === "month"
            ? "month"
            : "day";

    const selectedDate =
        params.date && isValidDate(params.date)
            ? params.date
            : today;

    const selectedMonth =
        params.month && isValidMonth(params.month)
            ? params.month
            : currentMonth;

    const { start, end } =
        getMonthRange(selectedMonth);

    const [
        profilesResult,
        attendanceResult,
        monthlyRecordsResult,
    ] = await Promise.all([
        getAttendanceProfiles(),
        getAttendanceByDate(selectedDate),
        getAttendanceByMonth(start, end),
    ]);

    const profiles = profilesResult ?? [];

    const attendanceRecords: AttendanceWithProfile[] =
        attendanceResult ?? [];

    const monthlyRecords = (
        monthlyRecordsResult ?? []
    ).map((record) => ({
        profileId: record.profile_id,
        attendanceDate: record.attendance_date,
        checkIn: record.check_in,
        checkOut: record.check_out,
        status: record.status,
    }));

    return (
        <Attendance
            profiles={profiles}
            attendanceRecords={attendanceRecords}
            monthlyRecords={monthlyRecords}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            view={view}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onMarkLate={handleMarkLate}
            onMarkAbsent={handleMarkAbsent}
        />
    );
}