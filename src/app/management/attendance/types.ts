import type {
  AttendanceProfile,
 AttendanceStatus,
  AttendanceWithProfile,
} from "@/services/attendance";

export type ViewMode = "day" | "month";
export type Profile = AttendanceProfile;
export type AttendanceRecord = AttendanceWithProfile;
export type StatusFilter = "Todos" | AttendanceStatus;
export type GroupMode = "none" | "department";

export type MonthlyAttendanceRecord = {
  profileId: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  absence_reason: string | null;
};

export type AttendanceAction = "check-in" | "check-out" | "late" | "absent";

export type AttendanceActionLoading = {
  profileId: string;
  action: AttendanceAction;
} | null;

export type AttentionStatus =
  | "Em falta"
  | "Atrasado"
  | "Sem saída";

export type AttendanceSummary = {
  total: number;
  present: number;
  late: number;
  absent: number;
  missing: number;
};

export type AttendanceAttention = {
  missingCheckIns: number;
  lateArrivals: number;
  missingCheckouts: number;
};

export type AttendanceProps = {
  profiles: Profile[];
  attendanceRecords: AttendanceRecord[];
  monthlyRecords: MonthlyAttendanceRecord[];
  selectedDate: string;
  selectedMonth: string;
  view: ViewMode;
  onCheckOut: (profileId: string) => Promise<void>;
  onMarkLate: (profileId: string) => Promise<void>;
onCheckIn: (
  profileId: string,
  time: string,
) => Promise<void>;

onMarkAbsent: (
  profileId: string,
  reason?: string,
) => Promise<void>;
};

export type AttendanceEmployeeDrawerProps = {
  profile: Profile | null;
  selectedDate: string;
  attendance: AttendanceRecord | null;
  monthlyRecords: MonthlyAttendanceRecord[];
  open: boolean;
  onClose: () => void;
};

