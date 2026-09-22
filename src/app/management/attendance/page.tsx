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

function getMonthRange(month: string) {
    const [year, monthNumber] = month.split("-").map(Number);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(monthNumber) ||
        monthNumber < 1 ||
        monthNumber > 12
    ) {
        return getMonthRange(getCurrentMonth());
    }

    const start = `${year}-${String(monthNumber).padStart(2, "0")}-01`;

    const lastDay = new Date(
        year,
        monthNumber,
        0,
    ).getDate();

    const end = `${year}-${String(monthNumber).padStart(2, "0")}-${String(
        lastDay,
    ).padStart(2, "0")}`;

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
    const currentMonth = getCurrentMonth();

    const view =
        params.view === "month"
            ? "month"
            : "day";

    const selectedDate =
        params.date ?? today;

    const selectedMonth =
        params.month &&
        /^\d{4}-\d{2}$/.test(params.month)
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

    const profiles =
        profilesResult ?? [];

    const attendanceRecords: AttendanceWithProfile[] =
        attendanceResult ?? [];

    const monthlyRecords = (
        monthlyRecordsResult ?? []
    ).map((record) => ({
        profileId: record.profile_id,
        attendanceDate:
            record.attendance_date,
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