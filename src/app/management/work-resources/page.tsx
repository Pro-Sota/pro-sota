import EquipmentPage, {
  type Resource,
  type ResourceMovement,
  type ResourceStats,
} from "./work_resource"

import {
  getResources,
  getRecentResourceMovements,
  getResourceStats,
} from "@/services/resources";

export default async function ResourcesPage() {
  const [
    resources,
    recentMovements,
    stats,
  ] = await Promise.all([
    getResources(),
    getRecentResourceMovements(10),
    getResourceStats(),
  ]);

  return (
    <EquipmentPage
      resources={resources as unknown as Resource[]}
      recentMovements={
        recentMovements as unknown as ResourceMovement[]
      }
      stats={stats as unknown as ResourceStats}
    />
  );
}