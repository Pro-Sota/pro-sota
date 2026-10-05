export const dynamic = "force-dynamic";

import ResourcesClientPage from "./work_resource";
import {
  getResourceLocations,
  getProjectsForResourceMovement,
  type Resource,
  type ResourceMovement,
  type ResourceStats,
  getProfilesForResourceMovement,
} from "@/services/resources";

import {
  getResources,
  getRecentResourceMovements,
  getResourceStats,
} from "@/services/resources";

export default async function ResourcesPage() {
  const [resources, recentMovements, stats, projects, locations, profiles] =
    await Promise.all([
      getResources(),
      getRecentResourceMovements(10),
      getResourceStats(),
      getProjectsForResourceMovement(),
      getResourceLocations(),
      getProfilesForResourceMovement(),
    ]);

  return (
    <ResourcesClientPage
      resources={resources as unknown as Resource[]}
      recentMovements={recentMovements as unknown as ResourceMovement[]}
      stats={stats as unknown as ResourceStats}
      locations={locations}
      projects={projects}
      profiles={profiles}
    />
  );
}
