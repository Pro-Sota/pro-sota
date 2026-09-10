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
    | "Project Manager"
    | "Coordinator"
    | "Architect"
    | "Engineer"
    | "Partner";

export type Status = "disponível" | "ocupado" | "ausente";


export const roleTranslations: Record<Role, string> = {
    "Project Manager": "Gestor do projecto",
    Coordinator: "Coordenador",
    Architect: "Arquitecto",
    Engineer: "Engenheiro",
    Partner: "Parceiro",
};

export const roles: Role[] = [
    "Project Manager",
    "Coordinator",
    "Architect",
    "Engineer",
    "Partner",
];


export type TeamMember = {
    project_members_id: string;
    profile_id: string;
    role: Role;
    first_name: string;
    last_name: string;
    avatar_url: string;
    status: Status;
    tasks: unknown[];
};


const roleNames: Record<Role, string> = {
    Architect: "Arquitecto",
    Engineer: "Engenheiro",
    Partner: "Parceiro",
    Coordinator: "Coordenador",
    "Project Manager": "Gestor do projecto",
};