"use client";


import { ViewMode } from "gantt-task-react/dist/types/public-types";
import GanttChart from "./gantt";

export default function Timeline() {

    const tasks = [
        {
            start: new Date(2026, 6, 1),
            end: new Date(2026, 6, 5),
            name: "Task 1",
            id: "Task 1",
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
    const daysBetween = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{ minWidth: "max-content" }} className="text-gray-700">
                <GanttChart tasks={tasks} />
            </div>
        </div>
    );
}