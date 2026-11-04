import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectBriefingDetails } from "@/services/project_briefing";

import BriefingSummary from "./briefing_summary";

type PageProps = {
    params: Promise<{
        briefingId: string;
    }>;
};

export default async function ProjectBriefingPage({
    params,
}: PageProps) {
    const { briefingId } = await params;

    let result;

    try {
        result = await getProjectBriefingDetails(briefingId);
    } catch {
        notFound();
    }

    if (!result?.briefing) {
        notFound();
    }

    const { briefing, attachments } = result;

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px] space-y-6">
                <Link
                    href="/management/project-briefs"
                    className="inline-flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#002950]"
                >
                    <ArrowLeft size={17} />
                    Voltar aos briefings
                </Link>

                <BriefingSummary
                    briefing={briefing}
                    attachments={
                        (attachments ?? []) as unknown as Parameters<
                            typeof BriefingSummary
                        >[0]["attachments"]
                    }
                />
            </div>
        </main>
    );
}