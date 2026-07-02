"use client";

import React from "react";

/**
 * Simple architecture project Gantt chart (no libraries)
 */

type Task = {
  id: string;
  name: string;
  phase: string;
  start: number; // day index
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
    <div className="p-6 space-y-6 text-gray-700">
      <h1 className="text-2xl font-bold">Chronograma</h1>

      {/* Timeline Header */}
      <div className="grid grid-cols-40 text-xs text-gray-500 border-b pb-2">
        {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
          <div key={i} className="text-center">
            {i % 5 === 0 ? `D${i}` : ""}
          </div>
        ))}
      </div>

      {/* Gantt Rows */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="grid grid-cols-40 items-center gap-1">

            {/* Task label */}
            
            <div className="col-span-6 text-sm font-medium">
              {task.name}
            </div>

            {/* Timeline grid */}
            <div className="col-span-34 relative h-6 bg-gray-100 rounded">

              <div
                className={`absolute h-6 rounded ${getPhaseColor(task.phase)}`}
                style={{
                  left: `${(task.start / TOTAL_DAYS) * 100}%`,
                  width: `${(task.duration / TOTAL_DAYS) * 100}%`,
                }}
              />

              {/* Progress overlay */}
              <div
                className="absolute h-6 bg-black/20 rounded"
                style={{
                  left: `${(task.start / TOTAL_DAYS) * 100}%`,
                  width: `${(task.duration * task.progress) / TOTAL_DAYS}%`,
                }}
              />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}