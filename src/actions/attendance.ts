
"use server";

import { revalidatePath } from "next/cache";
import { registerManualCheckIn } from "@/services/attendance";

import { getAttendanceByProfile } from "@/services/attendance";

export async function loadAttendanceHistory(profileId: string) {

    if (!profileId) {
        throw new Error("Colaborador inválido.");
    }

    return getAttendanceByProfile(profileId);
}




function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

export async function registerManualCheckInAction(
    profileId: string,
    attendanceDate: string,
    time: string,
): Promise<{ success: true }> {
    if (!profileId?.trim()) {
        throw new Error("Colaborador inválido.");
    }

    if (!isValidDate(attendanceDate)) {
        throw new Error("A data indicada é inválida.");
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new Error("Indique uma hora válida.");
    }

    await registerManualCheckIn(profileId, attendanceDate, time);

    revalidatePath("/management/attendance");

    return { success: true };
}
