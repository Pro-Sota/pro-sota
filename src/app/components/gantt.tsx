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

type Milestone = {
  name: string;
  day: number;
  type: "review" | "submission" | "deadline";
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

const milestones: Milestone[] = [
  {
    name: "Client Review",
    day: 45,
    type: "review",
  },
  {
    name: "Authority Submission",
    day: 120,
    type: "submission",
  },
  {
    name: "Tender Deadline",
    day: 210,
    type: "deadline",
  },
];

const TOTAL_DAYS = 365;
const DAY_WIDTH = 28;
const LABEL_WIDTH = 200;

const BASE_DATE = new Date(2026, 0, 1);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}


function getTodayOffset() {
  const today = new Date();

  const difference = Math.floor(
    (today.getTime() - BASE_DATE.getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return difference * DAY_WIDTH;
}


function getPhaseColor(phase: string) {
  switch (phase) {
    case "Concept Design":
      return "bg-blue-500 border-blue-600";

    case "Schematic Design":
      return "bg-green-500 border-green-600";

    case "Design Development":
      return "bg-purple-500 border-purple-600";

    default:
      return "bg-gray-500 border-gray-600";
  }
}


const days = Array.from(
  { length: TOTAL_DAYS },
  (_, i) => addDays(BASE_DATE, i)
);


const monthSegments = days.reduce<
  { label: string; days: number }[]
>((segments, date) => {

  const label =
    `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

  const last = segments[segments.length - 1];

  if (last && last.label === label) {
    last.days += 1;
  } else {
    segments.push({
      label,
      days: 1,
    });
  }

  return segments;

}, []);


const TIMELINE_WIDTH = TOTAL_DAYS * DAY_WIDTH;


export default function Page() {

  const todayPosition = getTodayOffset();


  return (
    <div className="w-full py-6 space-y-6 text-gray-700">

      <h1 className="text-2xl font-bold">
        Chronograma
      </h1>


      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-500">

        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-500" />
          Concept Design
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-green-500" />
          Schematic Design
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-500" />
          Design Development
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-red-500" />
          Today
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-blue-400" />
          Review
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-purple-400" />
          Submission
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-red-400" />
          Deadline
        </span>

      </div>



      <div className="border border-slate-200 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">

          <div style={{
            width: LABEL_WIDTH + TIMELINE_WIDTH
          }}>


            {/* Header */}
            <div className="flex sticky top-0 z-30 bg-white border-b">

              <div
                className="
                  shrink-0
                  sticky
                  left-0
                  z-50
                  bg-white
                  border-r
                  border-slate-200
                  flex
                  items-center
                  px-3
                "
                style={{
                  width: LABEL_WIDTH,
                }}
              >
                <span className="text-xs font-medium">
                  Task
                </span>
              </div>


              <div>

                <div className="flex border-b">

                  {monthSegments.map((seg, i) => (
                    <div
                      key={i}
                      className="text-xs text-center py-1 border-r"
                      style={{
                        width: seg.days * DAY_WIDTH
                      }}
                    >
                      {seg.label}
                    </div>
                  ))}

                </div>


                <div className="flex">

                  {days.map((d, i) => (
                    <div
                      key={i}
                      className="text-[10px] text-center py-1"
                      style={{
                        width: DAY_WIDTH
                      }}
                    >
                      {d.getDate()}
                    </div>
                  ))}

                </div>

              </div>

            </div>



            {/* Rows */}
            <div className="divide-y bg-white">
              {tasks.map(task => {

                const barLeft =
                  task.start * DAY_WIDTH;

                const barWidth =
                  task.duration * DAY_WIDTH;

                const progressWidth =
                  (task.progress / 100) * barWidth;
                return (

                  <div
                    key={task.id}
                    className="flex items-center h-11"
                  >

                    <div
                      className="shrink-0 sticky left-0 z-20 bg-white border-r flex items-center px-3"
                      style={{
                        width: LABEL_WIDTH
                      }}
                    >
                      <span className="text-sm font-medium">
                        {task.name}
                      </span>
                    </div>



                    <div
                      className="relative h-full"
                      style={{
                        width: TIMELINE_WIDTH,
                        backgroundImage:
                          "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px)",
                        backgroundSize:
                          `${DAY_WIDTH}px 100%`,
                      }}
                    >


                      {/* TODAY LINE */}
                      {todayPosition >= 0 &&
                        todayPosition <= TIMELINE_WIDTH && (

                          <div
                            className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-0"
                            style={{
                              left: todayPosition
                            }}
                          />

                        )}



                      {/* MILESTONES */}
                      {milestones.map(m => (

                        <div
                          key={m.name}
                          className="absolute top-0 bottom-0 z-0"
                          style={{
                            left: m.day * DAY_WIDTH
                          }}
                        >

                          <div
                            className={`
                              h-full w-[2px]
                              ${m.type === "review"
                                ? "bg-blue-400"
                                : m.type === "submission"
                                  ? "bg-purple-400"
                                  : "bg-red-400"
                              }
                            `}
                          />

                          <span
                            className="
                              absolute
                              -top-5
                              left-2
                              z-20
                              whitespace-nowrap
                              text-[10px]
                              bg-white
                              border
                              rounded
                              px-1
                              shadow-sm
                            "
                          >
                            {m.name}
                          </span>

                        </div>

                      ))}



                      {/* TASK BAR */}
                      <div
                        className="
                        shrink-0
                        sticky
                        left-0
                        z-[60]
                        bg-white
                        border-r
                        border-slate-200
                        flex
                        items-end
                        px-3
                        pb-2
                      ">
                        <div
                          className="h-full bg-black/20 rounded-l-md"
                          style={{
                            width: progressWidth
                          }}
                        />

                      </div>


                    </div>


                  </div>

                )

              })}

            </div>


          </div>

        </div>

      </div>


    </div>
  );
}