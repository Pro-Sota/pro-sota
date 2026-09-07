"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UserPlus, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/loader";

type Role =
  | "project-manager"
  | "coordenador"
  | "architect"
  | "engineer"
  | "partner";

type Status = "disponível" | "ocupado" | "ausente";

type Profile = {
  id: string;
  name: string;
  image: string;
  role: Role;
  status: Status;
  tasks: unknown[];
};

type TeamCardProps = {
  profile: Profile;
  onViewProfile: (profile: Profile) => void;
};

type ManageRolesModalProps = {
  members: Profile[];
  onClose: () => void;
};

const roleLabels: Record<Role, string> = {
  "project-manager": "Gestor do projecto",
  coordenador: "Coordenador",
  architect: "Arquitecto",
  engineer: "Engenheiro",
  partner: "Parceiros",
};

const statusStyles: Record<Status, { dot: string; label: string }> = {
  disponível: {
    dot: "bg-emerald-500",
    label: "Disponível",
  },
  ocupado: {
    dot: "bg-amber-500",
    label: "Ocupado",
  },
  ausente: {
    dot: "bg-gray-400",
    label: "Ausente",
  },
};

export default function Team() {
  const [manageRolesOpen, setManageRolesOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /*
   * Replace this with your Supabase data.
   */
  const members: Profile[] = [];

  const sections: { title: string; role: Role }[] = [
    {
      title: "Gestor do projecto",
      role: "project-manager",
    },
    {
      title: "Coordenador",
      role: "coordenador",
    },
    {
      title: "Arquitectos",
      role: "architect",
    },
    {
      title: "Engenheiros",
      role: "engineer",
    },
    {
      title: "Parceiros",
      role: "partner",
    },
  ];

  const handleViewProfile = (profile: Profile) => {
    router.push(`/management/team/profile/${profile.id}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /*
   * Prevent the page behind the modal from scrolling.
   */
  useEffect(() => {
    if (!manageRolesOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [manageRolesOpen]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="mx-auto my-8 h-full max-w-7xl px-6 pb-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Equipa</h1>

          <div className="flex items-center gap-3">
            {/* Manage team */}
            <button
              type="button"
              onClick={() => setManageRolesOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <Settings size={18} />
              Gerir responsáveis
            </button>

            {/* Add member */}
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <UserPlus size={18} />
              Adicionar membro
            </button>
          </div>
        </div>

        {/* Team Sections */}
        {sections.map((section) => {
          const sectionMembers = members.filter(
            (member) => member.role === section.role,
          );

          return (
            <div key={section.role} className="mb-10">
              {/* Section header */}
              <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                <h2 className="font-semibold text-gray-800">{section.title}</h2>

                <span className="text-xs text-gray-400">
                  {sectionMembers.length}
                </span>
              </div>

              {/* Empty state */}
              {sectionMembers.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">
                  Nenhum membro nesta equipa.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sectionMembers.map((member) => (
                    <TeamCard
                      key={member.id}
                      profile={member}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Recent Activity */}
        <div className="mb-8 text-gray-700">
          <h2 className="mb-4 border-b border-gray-100 pb-2 font-semibold text-gray-800">
            Actividades recentes
          </h2>

          <div className="mb-8 rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
            Nenhuma actividade recente.
          </div>
        </div>
      </div>

      {/* Manage Responsibilities Modal */}
      {manageRolesOpen && (
        <ManageRolesModal
          members={members}
          onClose={() => setManageRolesOpen(false)}
        />
      )}
      {addMemberOpen && (
        <AddMemberModal
          members={members}
          onClose={() => setAddMemberOpen(false)}
        />
      )}
    </>
  );
}

type AddMemberModalProps = {
  members: Profile[];
  onClose: () => void;
};

function AddMemberModal({ members, onClose }: AddMemberModalProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [role, setRole] = useState<Role>("architect");
  const [status, setStatus] = useState<Status>("disponível");

  /*
   * This will eventually insert the member into your
   * team_members table through Supabase.
   */
  const handleAddMember = async () => {
    if (!selectedMemberId) return;

    const newMember = {
      profile_id: selectedMemberId,
      role,
      status,
    };

    console.log("Adding member:", newMember);

    // Example:
    //
    // await addTeamMember({
    //     profileId: selectedMemberId,
    //     role,
    //     status,
    // });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2
              id="add-member-title"
              className="text-lg font-semibold text-gray-800"
            >
              Adicionar membro
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Adicione um utilizador à equipa.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 px-6 py-6">
          {/* Member */}
          <div>
            <label
              htmlFor="team-member"
              className="block text-sm font-medium text-gray-700"
            >
              Membro
            </label>

            <p className="mt-1 text-xs text-gray-400">
              Seleccione o utilizador que pretende adicionar.
            </p>

            <select
              id="team-member"
              value={selectedMemberId}
              onChange={(event) => setSelectedMemberId(event.target.value)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Seleccionar membro</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="member-role"
              className="block text-sm font-medium text-gray-700"
            >
              Função
            </label>

            <select
              id="member-role"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="architect">Arquitecto</option>

              <option value="engineer">Engenheiro</option>

              <option value="partner">Parceiro</option>

              <option value="coordenador">Coordenador</option>

              <option value="project-manager">Gestor do projecto</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="member-status"
              className="block text-sm font-medium text-gray-700"
            >
              Estado
            </label>

            <select
              id="member-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as Status)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="disponível">Disponível</option>

              <option value="ocupado">Ocupado</option>

              <option value="ausente">Ausente</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleAddMember}
            disabled={!selectedMemberId}
            className="cursor-pointer rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Adicionar membro
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Manage Responsibilities Modal
========================================================= */

function ManageRolesModal({ members, onClose }: ManageRolesModalProps) {
  /*
   * Get the current manager and coordinator.
   *
   * Later these values should ideally come from your
   * project/team data instead of being calculated from
   * the members array.
   */
  const currentManager = members.find(
    (member) => member.role === "project-manager",
  );

  const currentCoordinator = members.find(
    (member) => member.role === "coordenador",
  );

  const [managerId, setManagerId] = useState(currentManager?.id ?? "");

  const [coordinatorId, setCoordinatorId] = useState(
    currentCoordinator?.id ?? "",
  );

  /*
   * In the future this is where you would update Supabase.
   */
  const handleSave = async () => {
    console.log("New manager:", managerId);
    console.log("New coordinator:", coordinatorId);

    // Example:
    //
    // await updateTeamResponsibilities({
    //     managerId,
    //     coordinatorId,
    // });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-responsibilities-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2
              id="manage-responsibilities-title"
              className="text-lg font-semibold text-gray-800"
            >
              Gerir responsáveis
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Defina o gestor e o coordenador da equipa.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Manager */}
          <div>
            <label
              htmlFor="project-manager"
              className="block text-sm font-medium text-gray-700"
            >
              Gestor do projecto
            </label>

            <p className="mt-1 text-xs text-gray-400">
              Responsável pela gestão geral da equipa.
            </p>

            <select
              id="project-manager"
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Seleccionar gestor</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinator */}
          <div>
            <label
              htmlFor="coordinator"
              className="block text-sm font-medium text-gray-700"
            >
              Coordenador
            </label>

            <p className="mt-1 text-xs text-gray-400">
              Responsável pela coordenação da equipa.
            </p>

            <select
              id="coordinator"
              value={coordinatorId}
              onChange={(event) => setCoordinatorId(event.target.value)}
              className="mt-2 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Seleccionar coordenador</option>

              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="cursor-pointer rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Guardar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Team Card
========================================================= */

function TeamCard({ profile, onViewProfile }: TeamCardProps) {
  const status = statusStyles[profile.status];

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-4">
        {/* Profile image */}
        <div className="relative shrink-0">
          <Image
            src={profile.image}
            alt={profile.name}
            width={72}
            height={72}
            className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
          />

          <span
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${status.dot}`}
            title={status.label}
          />
        </div>

        {/* Profile information */}
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-base font-medium text-gray-800">
            {profile.name}
          </h3>

          <p className="text-sm text-gray-500">{roleLabels[profile.role]}</p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {profile.tasks.length} tarefas
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />

              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Profile button */}
      <button
        type="button"
        onClick={() => onViewProfile(profile)}
        className="mt-4 w-full cursor-pointer rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
      >
        Ver perfil
      </button>
    </div>
  );
}
