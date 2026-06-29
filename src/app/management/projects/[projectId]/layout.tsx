"use client";

import ProjectSideBar from "@/components/project_side_bar";
import { use } from "react";

export default function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}) {

    const {projectId} = use(params);

    return (
        <div className="flex">
            <ProjectSideBar projectId={projectId} />
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}