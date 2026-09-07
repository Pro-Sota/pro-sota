"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
} from "lucide-react";
import { ProgressBar } from "../ProgressBar";
import { Database } from "@/app/lib/supabase/models";

type Phase = Database["public"]["Tables"]["phases"]["Row"];



type Props = {
  phase: Phase;
};

export default function PhaseDetailPage({ phase }: Props) {
  const router = useRouter();

  return (<div className="min-h-screen"> <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

    {/* Header */}
    <div className="mb-6 flex items-center justify-between">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded px-2 py-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
    </div>

    {/* Phase Overview */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div
        className={`border-b bg-gradient-to-r  px-6 sm:px-8 py-6 sm:py-8`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {phase.name}
              </h1>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border `}
              >
                {phase.status}
              </span>
            </div>

            {phase.description && (
              <p className="text-sm text-gray-600 mt-3 max-w-2xl">
                {phase.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              {(phase.planned_start || phase.planned_end) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />

                  <span className="font-mono">
                    {phase.planned_start ?? "—"} até{" "}
                    {phase.planned_end ?? "—"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Progresso
            </p>

            <p className="text-4xl font-bold text-gray-900 font-mono">
              {phase.progress ?? 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 sm:px-8 py-6">
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="text-sm font-medium text-gray-700">
              Barra de progresso
            </label>

            <span className="text-sm text-gray-500">
              {phase.progress ?? 0}%
            </span>
          </div>

          <ProgressBar percent={phase.progress ?? 0} />
        </div>
      </div>
    </div>

    {/* Additional phase content can be added here later */}
    {/* 
      Deliverables, milestones, activity, team, etc.
      should come from their respective database tables
      instead of mock data.
    */}

  </div>
  </div>

  );
}
