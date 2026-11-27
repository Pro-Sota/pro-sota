import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { getTask } from "./tasks";

export async function submitTaskWork(
  taskId: string,
  notes: string,
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("submit_task_work", {
    p_task_id: taskId,
    p_notes: notes.trim() || null,
  });

  if (error) {
    throw new Error(`Não foi possível submeter o trabalho: ${error.message}`);
  }

  return getTask(taskId);
}

export async function reviewTaskWork(
  submissionId: string,
  decision: "approved" | "changes_requested",
  notes: string,
) {
  const supabase = await createClient();

  const { data: taskId, error } = await supabase.rpc(
    "review_task_work",
    {
      p_submission_id: submissionId,
      p_decision: decision,
      p_notes: notes.trim() || null,
    },
  );

  if (error || !taskId) {
    throw new Error(
      `Não foi possível rever o trabalho: ${error?.message ?? "Erro desconhecido."}`,
    );
  }

  return getTask(taskId);
}