import { Plus } from "lucide-react";

type Member = {
  profileId: string;
  name: string;
  picture?: string | null;
};

type Props = {
  members: Member[];
  onAdd?: () => void;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((item) => item[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TaskCardMembers({
  members,
  onAdd,
}: Props) {
  return (
    <div className="mt-4 flex items-center">
      <div className="flex -space-x-2">
        {members.slice(0, 4).map((member) => (
          <div
            key={member.profileId}
            title={member.name}
            className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-200 text-[10px] font-semibold text-gray-700"
          >
            {member.picture ? (
              <img
                src={member.picture}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(member.name)
            )}
          </div>
        ))}
      </div>

      {onAdd && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          className="ml-2 flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 transition hover:border-gray-500 hover:text-gray-700"
          aria-label="Adicionar responsável"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}