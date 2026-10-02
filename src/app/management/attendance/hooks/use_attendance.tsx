import { useMemo, useState } from "react";
import type { AttendanceStatus } from "@/services/attendance";
import type {
    AttendanceRecord,
    GroupMode,
    MonthlyAttendanceRecord,
    Profile,
    StatusFilter,
} from "../types";

type UseAttendanceProps = {
    profiles: Profile[];
    attendanceRecords: AttendanceRecord[];
    monthlyRecords: MonthlyAttendanceRecord[];
};

export function useAttendance({
    profiles,
    attendanceRecords,
    monthlyRecords,
}: UseAttendanceProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("Todos");
    const [areaFilter, setAreaFilter] =
        useState("Todas as áreas");
    const [groupMode, setGroupMode] =
        useState<GroupMode>("none");

    const areas = useMemo(
        () =>
            Array.from(
                new Set(
                    profiles
                        .map((profile) =>
                            profile.department?.trim(),
                        )
                        .filter(
                            (value): value is string =>
                                Boolean(value),
                        ),
                ),
            ).sort((a, b) =>
                a.localeCompare(b, "pt"),
            ),
        [profiles],
    );

    const attendanceByProfile = useMemo(
        () =>
            new Map(
                attendanceRecords.map((record) => [
                    record.profile_id,
                    record,
                ]),
            ),
        [attendanceRecords],
    );

    const monthlyAttendanceMap = useMemo(
        () =>
            new Map(
                monthlyRecords.map((record) => [
                    `${record.profileId}-${record.attendanceDate}`,
                    record,
                ]),
            ),
        [monthlyRecords],
    );

    const filteredProfiles = useMemo(() => {
        const query = search.trim().toLowerCase();

        return profiles.filter((profile) => {
            const fullName =
                `${profile.first_name} ${profile.last_name}`
                    .trim()
                    .toLowerCase();

            const jobTitle =
                profile.job_title?.toLowerCase() ?? "";

            const department =
                profile.department?.toLowerCase() ?? "";

            const record = attendanceByProfile.get(
                profile.profile_id,
            );

            const status: AttendanceStatus =
                record?.status ?? "Em falta";

            const matchesSearch =
                !query ||
                fullName.includes(query) ||
                jobTitle.includes(query) ||
                department.includes(query);

            const matchesArea =
                areaFilter === "Todas as áreas" ||
                profile.department === areaFilter;

            const matchesStatus =
                statusFilter === "Todos" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesArea &&
                matchesStatus
            );
        });
    }, [
        profiles,
        search,
        areaFilter,
        statusFilter,
        attendanceByProfile,
    ]);

    const summary = useMemo(() => {
        const result = {
            total: filteredProfiles.length,
            present: 0,
            late: 0,
            absent: 0,
            missing: 0,
        };

        for (const profile of filteredProfiles) {
            const status =
                attendanceByProfile.get(
                    profile.profile_id,
                )?.status ?? "Em falta";

            if (status === "Presente") {
                result.present++;
            } else if (status === "Atrasado") {
                result.late++;
            } else if (status === "Ausente") {
                result.absent++;
            } else {
                result.missing++;
            }
        }

        return result;
    }, [filteredProfiles, attendanceByProfile]);

    const attention = useMemo(() => {
        let missingCheckIns = 0;
        let lateArrivals = 0;
        let missingCheckouts = 0;

        for (const profile of filteredProfiles) {
            const record = attendanceByProfile.get(
                profile.profile_id,
            );

            if (!record) {
                missingCheckIns++;
            } else if (
                record.status === "Atrasado" &&
                !record.check_in
            ) {
                lateArrivals++;
            }

            if (
                record?.check_in &&
                !record.check_out &&
                record.status !== "Ausente"
            ) {
                missingCheckouts++;
            }
        }

        return {
            missingCheckIns,
            lateArrivals,
            missingCheckouts,
        };
    }, [filteredProfiles, attendanceByProfile]);

    const groupedProfiles = useMemo(() => {
        if (groupMode === "none") {
            return [
                {
                    department: null,
                    profiles: filteredProfiles,
                },
            ];
        }

        const groups = new Map<string, Profile[]>();

        for (const profile of filteredProfiles) {
            const department =
                profile.department?.trim() ||
                "Sem departamento";

            const list =
                groups.get(department) ?? [];

            list.push(profile);
            groups.set(department, list);
        }

        return Array.from(groups.entries())
            .sort((a, b) =>
                a[0].localeCompare(b[0], "pt"),
            )
            .map(([department, items]) => ({
                department,
                profiles: items,
            }));
    }, [filteredProfiles, groupMode]);

    return {
        search,
        setSearch,

        statusFilter,
        setStatusFilter,

        areaFilter,
        setAreaFilter,

        groupMode,
        setGroupMode,

        areas,

        attendanceByProfile,
        monthlyAttendanceMap,

        filteredProfiles,
        groupedProfiles,

        summary,
        attention,
    };
}