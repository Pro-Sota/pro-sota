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
    check_in: string | null;
    check_out: string | null;
    status: AttendanceStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
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
};

export type UpdateAttendanceInput = Partial<
    Omit<CreateAttendanceInput, 'profile_id'>
>;

function getTodayDate(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Luanda',
    }).format(new Date());
}

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
                updated_at,
                profile:profiles (
                    profile_id,
                    first_name,
                    last_name,
                    job_title,
                    department,
                    profile_picture
                )
            `,
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

    return (data ?? []) as AttendanceRecord[];
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
        attendance_date:
            input.attendance_date ?? getTodayDate(),
        check_in: input.check_in ?? null,
        check_out: input.check_out ?? null,
        status: input.status ?? 'Em falta',
        notes: input.notes ?? null,
    };

    const { data, error } = await supabase
        .from('attendance_records')
        .insert(payload)
        .select('*')
        .single();

    if (error) {
        console.error('createAttendance error:', error);
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
): Promise<AttendanceRecord> {
    const existingAttendance =
        await getAttendanceForMemberAndDate(
            profileId,
            attendanceDate,
        );

    if (existingAttendance?.check_in) {
        throw new Error(
            'Não é possível marcar como ausente um membro que já registou entrada.',
        );
    }

    if (existingAttendance) {
        return updateAttendance(
            existingAttendance.attendance_id,
            {
                status: 'Ausente',
                check_in: null,
                check_out: null,
            },
        );
    }

    return upsertAttendance({
        profile_id: profileId,
        attendance_date: attendanceDate,
        check_in: null,
        check_out: null,
        status: 'Ausente',
        notes: null,
    });
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
        attendance_date:
            input.attendance_date ?? getTodayDate(),
        check_in: input.check_in ?? null,
        check_out: input.check_out ?? null,
        status: input.status ?? 'Em falta',
        notes: input.notes ?? null,
    };

    const { data, error } = await supabase
        .from('attendance_records')
        .upsert(payload, {
            onConflict: 'profile_id,attendance_date',
        })
        .select('*')
        .single();

    if (error) {
        console.error('upsertAttendance error:', error);
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
        summary[record.status] += 1;
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
        summary[record.status] += 1;
    }

    return summary;
}