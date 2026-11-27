import { Clock3 } from "lucide-react";

import type { OverviewSubmission } from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import ListRow from "../components/list_row";
import SectionCard from "../components/section_card";
import { LABELS } from "../constants";
import { formatDateTime, plural } from "../components/format";

export default function ApprovalsSection({
  approvals,
}: {
  approvals: OverviewSubmission[];
}) {
  const count = approvals.length;

  return (
    <SectionCard
      title={LABELS.pendingApprovals}
      subtitle={`${plural(count, "submissão", "submissões")} por rever`}
    >
      {count > 0 ? (
        <ul className="divide-y divide-gray-100">
          {approvals.map((approval) => (
            <ListRow
              key={approval.submission_id}
              emphasis
              title={approval.title}
              meta={`${approval.type} · ${LABELS.submittedOn} ${formatDateTime(
                approval.submitted_at,
              )}`}
              status={approval.status}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Clock3}
          title={LABELS.emptyApprovals}
          message={LABELS.emptyApprovalsMessage}
        />
      )}
    </SectionCard>
  );
}