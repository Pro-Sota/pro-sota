import { notFound, redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
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
        project_code: project.project_code,
        title: project.title,
        description: project.description ?? "",
        type: project.type,
        location: project.location ?? "",
        municipality: project.municipality,
        status: project.status,
        urgency: project.urgency,
        address_line_1: project.address_line_1,
        address_line_2: project.address_line_2,
        city: project.city,
        country: project.country ?? "Angola",
        province: project.province,
        latitude: project.latitude,
        longitude: project.longitude,
        budget: project.budget,
        estimated_cost: project.estimated_cost,
        start_date: project.start_date,
        end_date: project.end_date,
        image: project.image,
        client_id: project.client_id,
    };

    return (
        <EditProjectForm
            projectId={projectId}
            initialValues={
                initialValues
            }
            clients={clients}
            onSave={updateProjectDetails.bind(null, projectId)}
            backHref={`/management/projects/${projectId}/overview`}
        />
    );


}