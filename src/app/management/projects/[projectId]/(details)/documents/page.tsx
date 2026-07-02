import ProjectSidebar from "./components/document_sidebar";

export default function ProjectDocument(){

    return (
        <div>
            <div className="flex flex-row items-center gap-4">
                <ProjectSidebar />
                <div className="flex-1 px-4 text-gray-800">
                    <h1 className="text-2xl font-bold mb-4">Project Documents</h1>
                    <p>Welcome to the project documents page. Here you can manage and view all documents related to your project.</p>
                </div>
            </div>
        </div>
    );
}