
export type CalendarParticipant = {
  profile_id: string;
  first_name: string | null;
  email: string | null;
};

export type CalendarClientOption = {
  client_id: string;
  name: string;
  email: string | null;
};

export type CalendarSupplierOption = {
  supplier_id: string;
  name: string;
  email: string | null;
};

export type AdminDashboardData = {
  currentUser: Record<string, unknown>;
  users: Record<string, unknown>[];
  participants: CalendarParticipant[];
  projects: Record<string, unknown>[];
  clients: CalendarClientOption[];
  suppliers: CalendarSupplierOption[];
  documents: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  deadlines: Record<string, unknown>[];
  activities: Record<string, unknown>[];
  teamWorkload: unknown;
};
