import { redirect } from "next/navigation";

import { getSession } from "@/services/auth_server";
import { getLeads } from "@/services/leads";

import LeadsInit from "./leads";

export default async function Page() {
    const { session } = await getSession();

    if (!session?.user) {
        redirect("/login");
    }

    const leads = await getLeads();

    return <LeadsInit leads={leads} />;
}