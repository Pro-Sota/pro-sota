import { ListChecks } from "lucide-react";

import type {
  OverviewData,
  OverviewSubmission,
} from "@/services/project_overview";

import EmptyState from "../components/empty_state";
import ListRow from "../components/list_row";
import SectionCard from "../components/section_card";
import { LABELS, ROUTES, SECTION_IDS } from "../constants";
import { formatMilestoneDate, plural } from "../components/format";

/** Rows shown per card; the "view all" link covers the rest. */
const MAX_ROWS = 5;

interface RequestListItem {
  id: string;
  subject: string;
  status: string;
  due: string;
}

export default function RequestsSection({
  rfis,
  submittals,
  projectBase,
}: {
  rfis: OverviewData["rfis"];
  submittals: OverviewSubmission[];
  projectBase: string;
}) {
  const rfiItems: RequestListItem[] = rfis.map((rfi) => ({
    id: rfi.id,
    subject: rfi.subject,
    status: rfi.status,
    due: formatMilestoneDate(rfi.due),
  }));

  const submissionItems: RequestListItem[] = submittals.map((submission) => ({
    id: submission.submission_id,
    subject: submission.title,
    status: submission.status,
    due: formatMilestoneDate(submission.due_date),
  }));

  const sections = [
    {
      id: SECTION_IDS.rfis,
      title: LABELS.rfis,
      emptyTitle: LABELS.emptyRfis,
      href: `${projectBase}/${ROUTES.rfis}`,
      items: rfiItems,
    },
    {
      id: SECTION_IDS.submissions,
      title: LABELS.submissions,
      emptyTitle: LABELS.emptySubmissions,
      href: `${projectBase}/${ROUTES.submissions}`,
      items: submissionItems,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
      {sections.map(({ id, title, emptyTitle, href, items }) => (
        <SectionCard
          key={id}
          id={id}
          title={title}
          subtitle={plural(items.length, "registo", "registos")}
          action={{ label: LABELS.viewAll, href }}
        >
          {items.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {items.slice(0, MAX_ROWS).map((item) => (
                <ListRow
                  key={item.id}
                  title={item.subject}
                  meta={`${LABELS.due}: ${item.due}`}
                  status={item.status}
                />
              ))}
            </ul>
          ) : (
            <EmptyState icon={ListChecks} title={emptyTitle} />
          )}
        </SectionCard>
      ))}
    </div>
  );
}