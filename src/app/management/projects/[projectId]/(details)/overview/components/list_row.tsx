import { StatusPill } from "./status_pill";

interface ListRowProps {
  title: string;
  meta: string;
  status: string;
  /** Medium-weight title (used for approvals). */
  emphasis?: boolean;
}

/** Shared "title + meta line + status pill" row. */
export default function ListRow({ title, meta, status, emphasis }: ListRowProps) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p
          className={`truncate text-sm text-gray-800 ${
            emphasis ? "font-medium" : ""
          }`}
        >
          {title}
        </p>
        <p className="mt-1 text-xs text-gray-500">{meta}</p>
      </div>

      <div className="shrink-0">
        <StatusPill status={status} />
      </div>
    </li>
  );
}