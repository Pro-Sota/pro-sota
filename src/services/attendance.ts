// src/services/attendance.ts

import { cookies } from 'next/headers';
import { createClient } from '@/app/lib/supabase/server';

export type AttendanceStatus =
    | 'Presente'
    | 'Ausente'
    | 'Atrasado'
    | 'Em falta';

export type AttendanceRecord = {
    attendance_id: string;
    profile_id: string;
    attendance_date: string;
    status: string;
    check_in: string | null;
    check_out: string | null;

    notes: string | null;
    absence_reason: string | null;
};

export type AttendanceProfile = {
    profile_id: string;
    first_name: string;
    last_name: string;
    job_title: string | null;
    department: string | null;
    profile_picture: string | null;
};

export type AttendanceWithProfile = AttendanceRecord & {
    profile: {
        profile_id: string;
        first_name: string;
        last_name: string;
        job_title: string | null;
        department: string | null;
        profile_picture: string | null;
    } | null;
};

export type CreateAttendanceInput = {
    profile_id: string;
    attendance_date?: string;
    check_in?: string | null;
    check_out?: string | null;
    status?: AttendanceStatus;
    notes?: string | null;
    absence_reason?: string | null;
};

export type UpdateAttendanceInput = Partial<
    Omit<CreateAttendanceInput, 'profile_id'>
>;


function normalizeError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }

    if (typeof error === 'object' && error !== null) {
        const message =
            'message' in error && typeof error.message === 'string'
                ? error.message
                : 'Ocorreu um erro ao processar a presença.';

        return new Error(message);
    }

    return new Error('Ocorreu um erro ao processar a presença.');
}

/**
 * Get all team members used by the attendance page.
 */
export async function getAttendanceProfiles(): Promise<
    AttendanceProfile[]
> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('profiles')
        .select(
            `
                profile_id,
                first_name,
                last_name,
                job_title,
                department,
                profile_picture
            `,
        )
        .order('first_name', { ascending: true })
        .order('last_name', { ascending: true });

    if (error) {
        console.error('getAttendanceProfiles error:', error);
        throw normalizeError(error);
    }

    return (data ?? []) as AttendanceProfile[];
}

/**
 * Get all attendance records for a specific date.
 */
export async function getAttendanceByDate(
    attendanceDate = getTodayDate(),
): Promise<AttendanceWithProfile[]> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('attendance_records')
        .select(`
            attendance_id,
            profile_id,
            attendance_date,
            check_in,
            check_out,
            status,
            notes,
            absence_reason,
            created_at,
            updated_at,
            profile:profiles (
                profile_id,
                first_name,
                last_name,
                job_title,
                department,
                profile_picture
            )
        `
        )
        .eq('attendance_date', attendanceDate)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('getAttendanceByDate error:', error);
        throw normalizeError(error);
    }

    return (data ?? []) as unknown as AttendanceWithProfile[];
}

/**
 * Get all attendance records between two dates.
 */
export async function getAttendanceByMonth(
    startDate: string,
    endDate: string,
): Promise<AttendanceRecord[]> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('attendance_records')
        .select(
            `
                attendance_id,
                profile_id,
                attendance_date,
                check_in,
                check_out,
                status,
                notes,
                created_at,
                updated_at
            `,
        )
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate)
        .order('attendance_date', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('getAttendanceByMonth error:', error);
        throw normalizeError(error);
    }

    return (data ?? []) as unknown as AttendanceRecord[];
}

/**
 * Get attendance for a specific team member.
 */
export async function getAttendanceByProfile(
    profileId: string,
    startDate?: string,
    endDate?: string,
): Promise<AttendanceRecord[]> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    let query = supabase
        .from('attendance_records')
        .select('*')
        .eq('profile_id', profileId)
        .order('attendance_date', { ascending: false });

    if (startDate) {
        query = query.gte('attendance_date', startDate);
    }

    if (endDate) {
        query = query.lte('attendance_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('getAttendanceByProfile error:', error);
        throw normalizeError(error);
    }

    return (data ?? []) as AttendanceRecord[];
}

/**
 * Get one attendance record by ID.
 */
export async function getAttendanceById(
    attendanceId: string,
): Promise<AttendanceRecord | null> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('attendance_id', attendanceId)
        .maybeSingle();

    if (error) {
        console.error('getAttendanceById error:', error);
        throw normalizeError(error);
    }

    return data as AttendanceRecord | null;
}

/**
 * Get a member's attendance record for a specific date.
 */
export async function getAttendanceForMemberAndDate(
    profileId: string,
    attendanceDate = getTodayDate(),
): Promise<AttendanceRecord | null> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('profile_id', profileId)
        .eq('attendance_date', attendanceDate)
        .maybeSingle();

    if (error) {
        console.error(
            'getAttendanceForMemberAndDate error:',
            error,
        );

        throw normalizeError(error);
    }

    return data as AttendanceRecord | null;
}

/**
 * Create an attendance record.
 */
export async function createAttendance(
    input: CreateAttendanceInput,
): Promise<AttendanceRecord> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const payload = {
        profile_id: input.profile_id,
        attendance_date: input.attendance_date ?? getTodayDate(),
        check_in: input.check_in ?? null,
        check_out: input.check_out ?? null,
        status: input.status ?? "Em falta",
        notes: input.notes ?? null,
        absence_reason: input.absence_reason ?? null,
    };

    const { data, error } = await supabase
        .from("attendance_records")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createAttendance error:", error);
        throw normalizeError(error);
    }

    return data as AttendanceRecord;
}

/**
 * Update an attendance record.
 */
export async function updateAttendance(
    attendanceId: string,
    input: UpdateAttendanceInput,
): Promise<AttendanceRecord> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('attendance_records')
        .update(input)
        .eq('attendance_id', attendanceId)
        .select('*')
        .single();

    if (error) {
        console.error('updateAttendance error:', error);
        throw normalizeError(error);
    }

    return data as AttendanceRecord;
}

/**
 * Delete an attendance record.
 */
export async function deleteAttendance(
    attendanceId: string,
): Promise<void> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('attendance_id', attendanceId);

    if (error) {
        console.error('deleteAttendance error:', error);
        throw normalizeError(error);
    }
}

/**
 * Register check-in for a member.
 *
 * If the member was previously marked as "Atrasado",
 * the status remains "Atrasado".
 *
 * If the member was explicitly marked "Ausente",
 * check-in is blocked so the absence is not silently overwritten.
 */
export async function registerCheckIn(
    profileId: string,
    attendanceDate = getTodayDate(),
    status?: AttendanceStatus,
): Promise<AttendanceRecord> {
    const existingAttendance =
        await getAttendanceForMemberAndDate(
            profileId,
            attendanceDate,
        );

    if (existingAttendance?.status === 'Ausente') {
        throw new Error(
            'Este membro foi marcado como ausente e não pode registar entrada sem alterar o registo de presença.',
        );
    }

    if (existingAttendance?.check_in) {
        throw new Error(
            'A entrada deste membro já foi registada.',
        );
    }

    const checkIn = new Date().toISOString();

    const finalStatus =
        status ??
        (existingAttendance?.status === 'Atrasado'
            ? 'Atrasado'
            : 'Presente');

    if (existingAttendance) {
        return updateAttendance(
            existingAttendance.attendance_id,
            {
                check_in: checkIn,
                status: finalStatus,
            },
        );
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
        .from('attendance_records')
        .insert({
            profile_id: profileId,
            attendance_date: attendanceDate,
            check_in: checkIn,
            check_out: null,
            status: finalStatus,
            notes: null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('registerCheckIn error:', error);
        throw normalizeError(error);
    }

    return data as AttendanceRecord;
}

/**
 * Mark a member as late for a specific date.
 *
 * This does not create a check-in time.
 * The actual arrival can be registered afterwards.
 */
export async function registerLate(
    profileId: string,
    attendanceDate = getTodayDate(),
): Promise<AttendanceRecord> {
    const existingAttendance =
        await getAttendanceForMemberAndDate(
            profileId,
            attendanceDate,
        );

    if (existingAttendance?.status === 'Ausente') {
        throw new Error(
            'Este membro já foi marcado como ausente.',
        );
    }

    if (existingAttendance?.check_in) {
        return updateAttendance(
            existingAttendance.attendance_id,
            {
                status: 'Atrasado',
            },
        );
    }

    if (existingAttendance) {
        return updateAttendance(
            existingAttendance.attendance_id,
            {
                status: 'Atrasado',
            },
        );
    }

    return upsertAttendance({
        profile_id: profileId,
        attendance_date: attendanceDate,
        check_in: null,
        check_out: null,
        status: 'Atrasado',
        notes: null,
    });
}

/**
 * Mark a member as absent for a specific date.
 */
export async function registerAbsent(
    profileId: string,
    attendanceDate = getTodayDate(),
    reason?: string,
): Promise<AttendanceRecord> {
    const absenceReason = reason?.trim();

    if (!absenceReason) {
        throw new Error("O motivo da falta é obrigatório.");
    }

    const existingAttendance = await getAttendanceForMemberAndDate(
        profileId,
        attendanceDate,
    );

    if (existingAttendance?.check_in) {
        throw new Error(
            "Não é possível marcar como ausente um colaborador que já registou entrada.",
        );
    }

    const attendanceData = {
        profile_id: profileId,
        attendance_date: attendanceDate,
        check_in: null,
        check_out: null,
        status: "Ausente" as const,
        notes: absenceReason,
        absence_reason: absenceReason,
    };

    if (existingAttendance) {
        return updateAttendance(existingAttendance.attendance_id, {
            status: "Ausente",
            check_in: null,
            check_out: null,
            notes: absenceReason,
            absence_reason: absenceReason,
        });
    }

    return upsertAttendance(attendanceData);
}
/**
 * Register check-out for a member.
 */
export async function registerCheckOut(
    profileId: string,
    attendanceDate = getTodayDate(),
): Promise<AttendanceRecord> {
    const existingAttendance =
        await getAttendanceForMemberAndDate(
            profileId,
            attendanceDate,
        );

    if (!existingAttendance) {
        throw new Error(
            'Não é possível registar a saída sem um registo de entrada.',
        );
    }

    if (!existingAttendance.check_in) {
        throw new Error(
            'Não é possível registar a saída sem um registo de entrada.',
        );
    }

    if (existingAttendance.check_out) {
        throw new Error(
            'A saída deste membro já foi registada.',
        );
    }

    const checkOut = new Date().toISOString();

    return updateAttendance(
        existingAttendance.attendance_id,
        {
            check_out: checkOut,
        },
    );
}

/**
 * Create or update attendance for a member and date.
 */
export async function upsertAttendance(
    input: CreateAttendanceInput,
): Promise<AttendanceRecord> {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const payload = {
        profile_id: input.profile_id,
        attendance_date: input.attendance_date ?? getTodayDate(),
        check_in: input.check_in ?? null,
        check_out: input.check_out ?? null,
        status: input.status ?? "Em falta",
        notes: input.notes ?? null,
        absence_reason: input.absence_reason ?? null,
    };

    const { data, error } = await supabase
        .from("attendance_records")
        .upsert(payload, {
            onConflict: "profile_id,attendance_date",
        })
        .select("*")
        .single();

    if (error) {
        console.error("upsertAttendance error:", error);
        throw normalizeError(error);
    }

    return data as AttendanceRecord;
}

/**
 * Get attendance summary for a specific date.
 */
export async function getAttendanceSummary(
    attendanceDate = getTodayDate(),
): Promise<Record<AttendanceStatus, number>> {
    const records = await getAttendanceByDate(attendanceDate);

    const summary: Record<AttendanceStatus, number> = {
        Presente: 0,
        Ausente: 0,
        Atrasado: 0,
        'Em falta': 0,
    };

    for (const record of records) {
        const status = record.status as AttendanceStatus;
        summary[status] += 1;
    }

    return summary;
}

/**
 * Get attendance summary for a date range.
 */
export async function getAttendanceSummaryByRange(
    startDate: string,
    endDate: string,
): Promise<Record<AttendanceStatus, number>> {
    const records = await getAttendanceByMonth(
        startDate,
        endDate,
    );

    const summary: Record<AttendanceStatus, number> = {
        Presente: 0,
        Ausente: 0,
        Atrasado: 0,
        'Em falta': 0,
    };

    for (const record of records) {
        const status = record.status as AttendanceStatus;
        summary[status] += 1;
    }

    return summary;
}


/**
 * Register a manually supplied arrival time.
 * The time is interpreted in Africa/Luanda (UTC+01:00).
 */
/* -------------------------------------------------------------------------- */
/* Time zone — Angola / Luanda                                                */
/* -------------------------------------------------------------------------- */

const ATTENDANCE_TIME_ZONE = "Africa/Luanda";

/**
 * Returns today's date in Angola, in YYYY-MM-DD format.
 */
function getTodayDate(): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: ATTENDANCE_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Converts a date and time selected in Luanda into an absolute timestamp.
 *
 * Angola uses UTC+01:00 and does not observe daylight saving time.
 */
function luandaDateTimeToISOString(
    attendanceDate: string,
    time: string,
): string {
    const timestamp = new Date(
        `${attendanceDate}T${time}:00+01:00`,
    );

    if (Number.isNaN(timestamp.getTime())) {
        throw new Error(
            "Não foi possível interpretar a data e a hora indicadas.",
        );
    }

    return timestamp.toISOString();
}

/**
 * Register a manually supplied arrival time.
 *
 * The selected time is interpreted as local Angola/Luanda time,
 * then stored as an ISO timestamp in UTC.
 */
export async function registerManualCheckIn(
    profileId: string,
    attendanceDate: string,
    time: string,
): Promise<AttendanceRecord> {
    if (!profileId?.trim()) {
        throw new Error("Colaborador inválido.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
        throw new Error("A data indicada é inválida.");
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new Error("A hora indicada é inválida.");
    }

    // Validate that the date actually exists.
    const [year, month, day] = attendanceDate.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
        parsedDate.getUTCFullYear() !== year ||
        parsedDate.getUTCMonth() !== month - 1 ||
        parsedDate.getUTCDate() !== day
    ) {
        throw new Error("A data indicada é inválida.");
    }

    const today = getTodayDate();

    if (attendanceDate > today) {
        throw new Error(
            "Não é possível registar presença numa data futura.",
        );
    }

    // Interpret the selected time in Angola, not the server's local timezone.
    const checkInISOString = luandaDateTimeToISOString(
        attendanceDate,
        time,
    );

    const checkInTimestamp = new Date(checkInISOString).getTime();

    if (
        attendanceDate === today &&
        checkInTimestamp > Date.now()
    ) {
        throw new Error(
            "A hora de entrada não pode estar no futuro.",
        );
    }

    const existing = await getAttendanceForMemberAndDate(
        profileId,
        attendanceDate,
    );

    if (existing?.status === "Ausente") {
        throw new Error(
            "Este colaborador está marcado como ausente. Corrija o estado antes de registar a entrada.",
        );
    }

    if (existing?.check_in) {
        throw new Error(
            "A entrada já foi registada. Não foi alterada.",
        );
    }

    if (existing) {
        return updateAttendance(existing.attendance_id, {
            check_in: checkInISOString,
            status:
                existing.status === "Atrasado"
                    ? "Atrasado"
                    : "Presente",
        });
    }

    return createAttendance({
        profile_id: profileId,
        attendance_date: attendanceDate,
        check_in: checkInISOString,
        check_out: null,
        status: "Presente",
        notes: null,
    });
}
