"use client";

import Image from "next/image";
import { Project } from "../management/projects/types";
import { useRouter } from "next/navigation";
import { capitalize, removeCharacters } from "../lib/library";

export default function ProjectCard({ project }: { project: Project }) {
    const router = useRouter();
    return (
        <div
            onClick={() => router.push(`/management/projects/${project.id}`)}

            className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
            <Image src="/images/arch.jpg" alt="Project Image" width={400} height={300} className="object-cover w-full" />
            <div className="p-4 text-sm text-gray-600" >
                <h2 className="text-lg text-gray-900 font-semibold">{removeCharacters(capitalize(project.name))}</h2>
                <div className="flex justify-between items-center ">
                    <p>Status: {removeCharacters(capitalize(project.status))} </p>
                    <p>Progress: {project.progress}% </p>
                </div>
                <p>Client: {project.client}</p>
                <p>Location: {project.location}</p>
            </div>
        </div>
    );
}