export type TeamCardProps = {
    member: TeamMember;
    onViewProfile: (member: TeamMember) => void;
    roleColor?: string;
};

export type ManageRolesModalProps = {
    members: TeamMember[];
    onClose: () => void;
};

export type Role =
    | "project-manager"
    | "coordenador"
    | "architect"
    | "engineer"
    | "partner";

export type Status = "disponível" | "ocupado" | "ausente";


export type TeamMember = {
    user_project_id: string;
    profile_id: string;
    role: Role;
    first_name: string;
    last_name: string;
    avatar_url: string;
    status: Status;
    tasks: unknown[];
};
