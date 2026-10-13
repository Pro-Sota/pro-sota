
"use server";

import { getAttendanceByProfile } from "@/services/attendance";

export async function loadAttendanceHistory(profileId: string) {
    
    if (!profileId) {
        throw new Error("Colaborador inválido.");
    }

    return getAttendanceByProfile(profileId);
}
