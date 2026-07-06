import DocumentNav from "./components/document_nav";
import DocumentSidebar from "./components/document_side_bar";



export default async function DocumentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  searchParams: Promise<{ view?: "list" | "grid" }>
  params: {
    projectId: string;
  };
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex row w-full overflow-hidden">
      <DocumentSidebar projectId={projectId} />

      <main className="min-w-0 min-h-0 flex-1 overflow-y-auto bg-white">
        <DocumentNav />
        {children}
      </main>
    </div>
  );
}