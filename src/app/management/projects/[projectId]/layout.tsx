
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* Top navigation */}
      <nav className="z-20 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <Link
          href="/management/projects"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Projectos</span>
        </Link>
      </nav>

      {/* Project navigation and page */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="z-10 shrink-0">
          <ProjectNavbar projectId={projectId} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F7F7F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
