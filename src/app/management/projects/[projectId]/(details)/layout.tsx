import ProjectNavbar from "@/app/components/project_side_bar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="h-screen overflow-x-hidden">
      <nav className="flex  items-center justify-between border-b border-gray-200 bg-white py-2 px-4">
        <Link
          href="/management/projects"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Projectos</span>
        </Link>
      </nav>

      <div className="flex flex-col h-screen">
        <ProjectNavbar projectId={projectId} />
        <main className="flex-1 h-max  bg-[#F7F7F5] min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}