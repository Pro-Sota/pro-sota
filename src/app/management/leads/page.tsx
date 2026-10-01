import { redirect } from "next/navigation";

import { getSession } from "@/services/auth_server";
import { getLeads } from "@/services/leads";

import LeadsInit from "./leads";
import { requirePermission } from "@/app/lib/permissions/server";

export default async function Page() {
    await requirePermission("leads.view");

    const { session } = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    const leads = await getLeads();

    return <LeadsInit leads={leads} />;
}