import Link from "next/link";
import { FileText } from "lucide-react";

import EmptyState from "../components/empty_state";
import SectionCard from "../components/section_card";
import { FOCUS_RING, LABELS } from "../constants";
import { formatDateTime } from "../components/format";
import type { DocumentItem } from "../types";

export default function DocumentsSection({ items }: { items: DocumentItem[] }) {
  return (
    <SectionCard title={LABELS.documents}>
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {items.map((doc) => {
            const meta = [
              doc.revision && `${LABELS.revision} ${doc.revision}`,
              doc.uploadedBy,
              formatDateTime(doc.uploadedAt),
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
                {doc.href ? (
                  <Link
                    href={doc.href}
                    className={`block rounded text-sm text-gray-800 hover:text-gray-950 hover:underline ${FOCUS_RING}`}
                  >
                    {doc.name}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-800">{doc.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{meta}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={FileText} title={LABELS.emptyDocuments} />
      )}
    </SectionCard>
  );
}