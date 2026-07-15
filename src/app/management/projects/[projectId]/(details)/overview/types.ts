export const kpis = [
  { title: "Progress", value: "30" },
  { title: "Days remaining", value: "30" },
  { title: "Budget used", value: "$120k" },
  { title: "Open issues", value: "10" },
  { title: "Completed tasks", value: "100 / 200" },
  { title: "Pending approvals", value: "7" },
];

export type Status =
  | "Completed"
  | "Answered"
  | "Open"
  | "Overdue"
  | "Pending"
  | "For review";