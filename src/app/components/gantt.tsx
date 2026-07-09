"use client";

import React from "react";

type Task = {
  id: string;
  name: string;
  phase: string;
  start: number;
  duration: number;
  progress: number;
};

const tasks: Task[] = [
  { id: "1", name: "Site Survey", phase: "Concept Design", start: 1, duration: 5, progress: 100 },
  { id: "2", name: "Sketch Plans", phase: "Concept Design", start: 4, duration: 8, progress: 60 },
  { id: "3", name: "Client Approval", phase: "Concept Design", start: 10, duration: 2, progress: 20 },
  { id: "4", name: "Floor Plans", phase: "Schematic Design", start: 12, duration: 10, progress: 40 },
  { id: "5", name: "Elevations", phase: "Schematic Design", start: 14, duration: 8, progress: 30 },
  { id: "6", name: "Structural Design", phase: "Design Development", start: 22, duration: 12, progress: 10 },
  { id: "7", name: "MEP Coordination", phase: "Design Development", start: 24, duration: 10, progress: 5 },
];

const TOTAL_DAYS = 40;

function getPhaseColor(phase: string) {
  switch (phase) {
    case "Concept Design":
      return "bg-blue-500";
    case "Schematic Design":
      return "bg-green-500";
    case "Design Development":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
}

export default function Page() {
  return (
    <div className="w-full p-6 space-y-6 text-gray-700">
      <h1 className="text-2xl font-bold">Chronograma</h1>

      {/* Timeline Header */}
      <div className="sticky top-0 z-10 bg-white border-b pb-2">
        <div className="flex">
          <div className="w-56 shrink-0 text-xs text-gray-500">
            Task
          </div>

          <div className="flex-1 grid grid-cols-40 text-xs text-gray-500">
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <div key={i} className="text-center">
                {i % 5 === 0 ? `D${i}` : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const startPct = (task.start / TOTAL_DAYS) * 100;
          const widthPct = (task.duration / TOTAL_DAYS) * 100;
          const progressPct = (task.progress / 100) * widthPct;

          return (
            <div key={task.id} className="flex items-center">
              {/* Label */}
              <div className="w-56 pr-4 text-sm font-medium truncate">
                {task.name}
              </div>

              {/* Timeline */}
              <div className="flex-1 relative h-7 bg-gray-100 rounded-md overflow-hidden">
                
                {/* Task bar */}
                <div
                  className={`absolute top-0 h-full rounded-md ${getPhaseColor(task.phase)}`}
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                  }}
                />

                {/* Progress overlay */}
                <div
                  className="absolute top-0 h-full bg-black/20 rounded-md"
                  style={{
                    left: `${startPct}%`,
                    width: `${progressPct}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}