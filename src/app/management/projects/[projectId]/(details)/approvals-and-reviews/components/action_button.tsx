import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  tone: "green" | "red" | "blue" | "gray";
}


export default function ActionButton({ onClick, icon: Icon, label, tone } : ActionButtonProps) {
    const tones: Record<ActionButtonProps['tone'], string> = {
        green: 'text-green-700 hover:bg-green-50 focus-visible:ring-green-500',
        red: 'text-red-700 hover:bg-red-50 focus-visible:ring-red-500',
        blue: 'text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500',
        gray: 'text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
    };
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${tones[tone]}`}
        >
            <Icon size={15} strokeWidth={2.25} />
            <span>{label}</span>
        </button>
    );
}