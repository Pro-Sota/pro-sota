import { useRouter } from "next/navigation";

type Status =
    | "em-curso"
    | "concluido"
    | "em-observacao";

type Project = {
    id: number;
    name: string;
    progress: number;
    priority: "Low" | "Medium" | "High";
    status: Status;
    dueDate: string;
    location: string;
};

export default function ProjectTableView({ projects }: { projects: Project[] }) {

    const router = useRouter();

    const priorityColor = (priority: "Low" | "Medium" | "High") => {
        switch (priority) {
            case "Low":
                return "bg-green-500";
            case "Medium":
                return "bg-yellow-500";
            case "High":
                return "bg-red-500";  
            }
        };

    const statusColor = (status: Status) => {
        switch (status) {
            case "em-curso":   
                return "bg-blue-500";
            case "concluido":
                return "bg-green-500"  
            case "em-observacao":
                return "bg-yellow-500";
        }
    };

    return (

        <table className="table-fixed w-full border-collapse border-t border-gray-300">
            <thead className="h-12">
                <tr className="text-left text-sm font-semibold ">
                    <th className="w-1/4">Project Name</th>
                    <th className="w-1/6">Progress</th>
                    <th className="w-1/6">Priority</th>
                    <th className="w-1/6">Estado</th>
                    <th className="w-1/6">Data de Entrega</th>
                    <th className="w-1/6">Localização</th>
                </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                    <tr
                        key={project.id}
                        onClick={() => router.push(`/management/projects/${project.id}`)}
                        className="cursor-pointer hover:bg-gray-100 h-20"
                    >
                        <td className="border-b border-gray-200 py-2">
                            <div className="text-sm font-semibold">{project.name}</div>
                        </td>
                        <td>
                            <div className="flex flex-row bg-slate-800 w-[50%] h-5 p-2 items-center text-white rounded-md text-sm">
                                {project.progress}%
                            </div>
                        </td>
                        <td className="border-b border-gray-200 py-2">
                            <div className="flex items-center">
                                <div className={`h-2.5 w-2.5 rounded-full ${priorityColor(project.priority)} me-2`}></div>{" "}
                                {project.priority}
                            </div>
                        </td>
                        <td className="border-b border-gray-200 py-2">
                            <div className="flex items-center">
                                <div className={`h-2.5 w-2.5 rounded-full ${statusColor(project.status)} me-2`}></div>{" "}
                                {project.status === "em-curso" && "In progress"}
                                {project.status === "concluido" && "Completed"}
                                {project.status === "em-observacao" && "On hold"}
                            </div>
                        </td>
                        <td className="border-b border-gray-200 py-2">{project.dueDate}</td>
                        <td className="border-b border-gray-200 py-2">{project.location}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}