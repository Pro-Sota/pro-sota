"use server";

import {
    deleteSubmission as deleteSubmissionService,
    updateSubmissionStatus as updateSubmissionStatusService,
} from "@/services/submissions";

import {
    Submission,
    SubmissionStatus,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */



function normalizeType(
    type: string,
): Submission["type"] {
    switch (type) {
        case "design":
            return "design";

        case "technical":
            return "technical";

        case "client_approval":
            return "client_approval";

        default:
            return "technical";
    }
}

/* -------------------------------------------------------------------------- */
/* Update status                                                              */
/* -------------------------------------------------------------------------- */

export async function updateSubmissionStatusAction(
    submissionId: string,
    status: SubmissionStatus,
): Promise<Submission | null> {
    try {
        const result =
            await updateSubmissionStatusService(
                submissionId,
                status,
            );

        return {
            id: result.id,
            project_id: result.project_id,
            title: result.title,
            description:
                result.description ??
                undefined,
            type: normalizeType(
                result.type,
            ),
            status: result.status as SubmissionStatus,
            submitted_by:
                result.submitted_by_name ||
                "Utilizador",
            submitted_date:
                result.submitted_date,
            due_date:
                result.due_date ?? "",
            notes:
                result.notes ??
                undefined,
            created_at:
                result.created_at,
            updated_at:
                result.updated_at,
        };
    } catch (error) {
        console.error(
            "updateSubmissionStatusAction:",
            error,
        );

        return null;
    }
}

/* -------------------------------------------------------------------------- */
/* Delete submission                                                          */
/* -------------------------------------------------------------------------- */

export async function deleteSubmissionAction(
    submissionId: string,
): Promise<boolean> {
    try {
        return await deleteSubmissionService(
            submissionId,
        );
    } catch (error) {
        console.error(
            "deleteSubmissionAction:",
            error,
        );

        return false;
    }
}