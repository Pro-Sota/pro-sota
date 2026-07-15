
export const tasks = [
  {
    start: new Date(2026, 6, 1),
    end: new Date(2026, 6, 5),
    name: "Task 1",
    id: "1",
    type: "task" as const,
    progress: 50,
    isDisabled: false,
  },
  {
    start: new Date(2026, 6, 1),
    end: new Date(2026, 6, 5),
    name: "Task 2",
    id: "2",
    type: "task" as const,
    progress: 50,
    isDisabled: false,
  },
  {
    start: new Date(2026, 8, 1),
    end: new Date(2026, 8, 5),
    name: "Task 3",
    id: "3",
    type: "task" as const,
    progress: 50,
    isDisabled: false,
  },
  {
    start: new Date(2026, 7, 1),
    end: new Date(2026, 7, 5),
    name: "Task 4",
    id: "4",
    type: "task" as const,
    progress: 50,
    isDisabled: true,
  },
];

// ---- New overview data ----

export const upcomingMilestones = [
  { name: "Permit submission", date: "Jul 18, 2026" },
  { name: "Client design review", date: "Jul 22, 2026" },
  { name: "Tender package due", date: "Aug 15, 2026" },
];

export const recentActivity = [
  { text: "A-201 Floor Plans revised to Rev C", who: "M. Alves", time: "2h ago" },
  { text: "RFI-014 answered by structural engineer", who: "J. Costa", time: "5h ago" },
  { text: "Client approved kitchen elevations", who: "Client", time: "Yesterday" },
  { text: "New comment on MEP coordination drawing", who: "R. Silva", time: "Yesterday" },
];

export const rfis = [
  { id: "RFI-017", subject: "Steel beam clash at gridline C4", status: "Overdue", due: "Jul 08, 2026" },
  { id: "RFI-016", subject: "Ceiling height in lobby", status: "Open", due: "Jul 15, 2026" },
  { id: "RFI-015", subject: "Window frame finish confirmation", status: "Open", due: "Jul 17, 2026" },
  { id: "RFI-014", subject: "Structural clash at column B2", status: "Answered", due: "Jul 10, 2026" },
];

export const submittals = [
  { id: "SUB-042", subject: "Curtain wall shop drawings", status: "Overdue", due: "Jul 09, 2026" },
  { id: "SUB-041", subject: "Elevator specifications", status: "Open", due: "Jul 19, 2026" },
  { id: "SUB-040", subject: "Fire-rated door schedule", status: "Answered", due: "Jul 05, 2026" },
];

export const approvals = [
  { item: "Kitchen elevations", requestedFrom: "Client", date: "Jul 11, 2026" },
  { item: "Facade material sample", requestedFrom: "Client", date: "Jul 12, 2026" },
  { item: "Structural steel spec", requestedFrom: "Structural engineer", date: "Jul 13, 2026" },
];

export const budgetByPhase = [
  { phase: "Concept Design", used: 25000, total: 25000 },
  { phase: "Schematic Design", used: 40000, total: 40000 },
  { phase: "Technical Design", used: 55000, total: 85000 },
  { phase: "Tender", used: 0, total: 15000 },
];

export const risks = [
  { text: "Curtain wall shop drawings overdue by 4 days", severity: "high" as const },
  { text: "Landscape consultant coordination unresolved", severity: "high" as const },
  { text: "MEP layout awaiting structural sign-off", severity: "medium" as const },
];