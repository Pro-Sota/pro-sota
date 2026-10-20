export type Role = "admin" | "director" | "user";

export type Permission = {
  key: string;
  label: string;
  module: string;
};

  export type Member = {
    profile_id: string;
    first_name: string;
    email: string;
    department: string;
    role: Role;
    initials: string;
  };

export type Overrides = Record<string, boolean>;

export type PermissionDraft = {
  profileId: string;
  role: Role;
  overrides: Overrides;
};

export type SaveResult = {
  success: boolean;
  error?: string;
};