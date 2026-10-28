
import { notFound } from "next/navigation";

import EditProjectForm from "./edit_page";
import { updateProjectDetails } from "@/services/project_dashboard";
import { getProjectById, getProjectClient } from "@/services/projects";

export default async function EditPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = await params;

    const [project, clients] = await Promise.all([
        getProjectById(projectId),
        getProjectClient(projectId),
    ]);

    if (!project) {
        notFound();
    }

    const initialValues = {
        project_code: project.project_code ?? "",
        title: project.title ?? "",
        description: project.description ?? "",
        type: project.type ?? "",
        status: project.status ?? "Em observação",
        urgency: project.urgency ?? "Medium",

        client_id: project.client_id ?? "",

        country: project.country ?? "Angola",
        province: project.province ?? "",
        municipality: project.municipality ?? "",
        city: project.city ?? "",
        address_line_1: project.address_line_1 ?? "",
        address_line_2: project.address_line_2 ?? "",
        latitude: project.latitude ?? "",
        longitude: project.longitude ?? "",

        budget: project.budget ?? "",
        estimated_cost: project.estimated_cost ?? "",

        start_date: project.start_date ?? "",
        end_date: project.end_date ?? "",
        actual_start_date: project.actual_start_date ?? "",
        actual_end_date: project.actual_end_date ?? "",

        contract_number: project.contract_number ?? "",
        external_reference: project.external_reference ?? "",
        completion_percentage: project.completion_percentage ?? 0,

        image: project.image ?? "",
    };

    return (
        <EditProjectForm
            projectId={projectId}
            projectCode={project.project_code ?? ""}
            initialValues={initialValues}
            clients={clients}
            onSave={updateProjectDetails.bind(null, projectId)}
            backHref={`/management/projects/${projectId}/overview`}
        />
    );
}
