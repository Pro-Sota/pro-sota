"use server";

import {
    addTeamMember,
    assignProjectRole,
    removeTeamMember,
    updateTeamMemberStatus,
} from "@/services/project_team";

import type { Status } from "@/services/project_team";

export async function addProjectTeamMemberAction(
    projectId: string,
    profileId: string,
    roleName: string,
) {
    return addTeamMember(
        projectId,
        profileId,
        roleName,
    );
}

export async function assignProjectRoleAction(
    projectId: string,
    profileId: string,
    roleName: string,
) {
    return assignProjectRole(
        projectId,
        profileId,
        roleName,
    );
}

export async function updateProjectTeamMemberStatusAction(
    userProjectId: string,
    status: Status,
) {
    return updateTeamMemberStatus(
        userProjectId,
        status,
    );
}

export async function removeProjectTeamMemberAction(
    userProjectId: string,
) {
    return removeTeamMember(
        userProjectId,
    );
}