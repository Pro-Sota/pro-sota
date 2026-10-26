import { getLeads } from "@/services/leads";
import LeadsInit from "./leads";

export const dynamic = "force-dynamic";

export default async function Page() {
    const leads = await getLeads();

    return <LeadsInit leads={leads} />;
}