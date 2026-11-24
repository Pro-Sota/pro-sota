
import { redirect } from "next/navigation";

import { getActivityPageData } from "@/services/activity_history";
import ActivityClient from "./activity_page";

export const metadata = {
  title: "Actividades | PRO SOTA",
  description: "Histórico de actividades do back office PRO SOTA.",
};

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const result = await getActivityPageData();

  if (!result.authorized) {
    if (result.reason === "unauthenticated") {
      redirect("/");
    }

    redirect("/management");
  }

  const { activities, profiles, totalCount } = result.data;

  return (
    <ActivityClient
      activities={activities}
      profiles={profiles}
      totalCount={totalCount}
    />
  );
}
