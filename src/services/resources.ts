import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ResourceType =
  | "material"
  | "equipment"
  | "tool"
  | "ppe"
  | "vehicle";

export type ResourceCondition =
  | "operational"
  | "restricted"
  | "maintenance"
  | "damaged"
  | "retired";

export type ResourceOperationalStatus =
  | "available"
  | "in_use"
  | "overdue"
  | "missing";

export type ResourceLocationType =
  | "warehouse"
  | "office"
  | "project"
  | "employee"
  | "supplier";

export type UnitOfMeasure =
  | "unidade"
  | "saco"
  | "kg"
  | "tonelada"
  | "m³"
  | "m"
  | "caixa"
  | "litro";

  

export type Resource = {
  resource_id: string;

  resource_code: string;
  name: string;

  resource_type: ResourceType;

  category: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;

  condition_status: ResourceCondition;
  operational_status: ResourceOperationalStatus;

  acquisition_date: string | null;
  replacement_value: number | null;

  notes: string | null;

  created_by: string | null;
  created_at: string;
  updated_at: string;

  /*
   * Optional enriched fields used by the
   * resource listing/table.
   */
  project_id?: string | null;
  project_name?: string | null;

  location_type?: ResourceLocationType | null;
  location_name?: string | null;

  holder_profile_id?: string | null;
  holder_name?: string | null;

  collection_date?: string | null;
  expected_return_date?: string | null;

  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;

  delivery_term_accepted?: boolean;

  unit_of_measure?: UnitOfMeasure | null;
  current_stock?: number | null;
  minimum_stock?: number | null;
  reserved_quantity?: number | null;
  quantity_in_works?: number | null;
  average_unit_cost?: number | null;
  stock_value?: number | null;

  supplier_id?: string | null;
  supplier_name?: string | null;

  batch_number?: string | null;
  expiry_date?: string | null;
};

export type ResourceMovementType =
  | "entry"
  | "exit"
  | "transfer"
  | "return"
  | "consumption"
  | "maintenance"
  | "retirement";

  

export type ResourceMovement = {
  movement_id: string;
  movement_date: string;

  movement_type: ResourceMovementType;

  resource_id: string;
  resource_name: string;

  quantity: number | null;
  unit: string | null;

  origin_location_id: string | null;
  origin_location_name: string | null;

  destination_location_id: string | null;
  destination_location_name: string | null;

  project_id: string | null;
  project_name: string | null;

  profile_id: string | null;
  profile_name: string | null;

  created_by: string | null;
  created_by_name: string | null;

  notes: string | null;
};

export type ResourceStats = {
  totalResources: number;
  totalReplacementValue: number;
  availableResources: number;
  resourcesInUse: number;
  resourcesInMaintenance: number;
  missingResources: number;
  damagedResources: number;
};

export type ResourceStock = {
  stock_id: string;
  resource_id: string;

  unit: string;

  current_quantity: number;
  minimum_quantity: number;
  reserved_quantity: number;
  quantity_in_projects: number;

  average_unit_cost: number;

  warehouse_id: string | null;
  supplier_id: string | null;

  batch_number: string | null;
  expiry_date: string | null;

  created_at: string;
  updated_at: string;
};

export type ResourceLocation = {
  location_id: string;
  name: string;
  location_type: ResourceLocationType;

  project_id: string | null;
  profile_id: string | null;
  supplier_id: string | null;

  notes: string | null;
};

import type {
    ResourceCondition,
    ResourceOperationalStatus,
    ResourceType,
} from "@/app/management/work-resources/"

export type ResourceStockInput = {
    unit: string | null;
    current_quantity: number;
    minimum_quantity: number;
    average_unit_cost: number;
    warehouse_id: string | null;
    supplier_id: string | null;
    batch_number: string | null;
    expiry_date: string | null;
};

export type ResourceFormInput = {
    resource_code: string;
    name: string;
    resource_type: ResourceType;
    category: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    condition_status: ResourceCondition;
    operational_status: ResourceOperationalStatus;
    acquisition_date: string | null;
    replacement_value: number | null;
    notes: string | null;
    stock: ResourceStockInput | null;
};

  export type CreateResourceInput = ResourceFormInput;

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export const RESOURCE_TYPE_LABELS: Record<
  ResourceType,
  string
> = {
  material: "Material consumível",
  equipment: "Equipamento",
  tool: "Ferramenta",
  ppe: "EPI",
  vehicle: "Viatura",
};

export const RESOURCE_CONDITION_LABELS: Record<
  ResourceCondition,
  string
> = {
  operational: "Operacional",
  restricted: "Com restrição",
  maintenance: "Em manutenção",
  damaged: "Avariado",
  retired: "Abatido",
};

export const RESOURCE_STATUS_LABELS: Record<
  ResourceOperationalStatus,
  string
> = {
  available: "Disponível",
  in_use: "Em utilização",
  overdue: "Em atraso",
  missing: "Em falta",
};

export const RESOURCE_MOVEMENT_TYPE_LABELS: Record<
  ResourceMovementType,
  string
> = {
  entry: "Entrada",
  exit: "Saída",
  transfer: "Transferência",
  return: "Devolução",
  consumption: "Consumo",
  maintenance: "Manutenção",
  retirement: "Baixa",
};

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore = await cookies();

  return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export async function createResource(
  input: CreateResourceInput,
): Promise<Resource> {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Utilizador não autenticado.",
    );
  }

  const resourceCode =
    input.resource_code.trim();

  const name = input.name.trim();

  if (!resourceCode) {
    throw new Error(
      "O código do recurso é obrigatório.",
    );
  }

  if (!name) {
    throw new Error(
      "O nome do recurso é obrigatório.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("resources")
    .insert({
      resource_code: resourceCode,
      name,

      resource_type:
        input.resource_type,

      category:
        input.category?.trim() || null,

      brand:
        input.brand?.trim() || null,

      model:
        input.model?.trim() || null,

      serial_number:
        input.serial_number?.trim() || null,

      condition_status:
        input.condition_status ??
        "operational",

      operational_status:
        input.operational_status ??
        "available",

      acquisition_date:
        input.acquisition_date || null,

      replacement_value:
        input.replacement_value ??
        null,

      notes:
        input.notes?.trim() || null,

      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "createResource error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return data as Resource;
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateResource(
  resourceId: string,
  input: UpdateResourceInput,
): Promise<Resource> {
  const supabase = await getSupabase();

  if (!resourceId) {
    throw new Error(
      "ID do recurso inválido.",
    );
  }

  const payload: Record<
    string,
    unknown
  > = {};

  if (
    input.resource_code !== undefined
  ) {
    const value =
      input.resource_code.trim();

    if (!value) {
      throw new Error(
        "O código do recurso é obrigatório.",
      );
    }

    payload.resource_code = value;
  }

  if (input.name !== undefined) {
    const value =
      input.name.trim();

    if (!value) {
      throw new Error(
        "O nome do recurso é obrigatório.",
      );
    }

    payload.name = value;
  }

  if (
    input.resource_type !==
    undefined
  ) {
    payload.resource_type =
      input.resource_type;
  }

  if (
    input.category !== undefined
  ) {
    payload.category =
      input.category?.trim() || null;
  }

  if (input.brand !== undefined) {
    payload.brand =
      input.brand?.trim() || null;
  }

  if (input.model !== undefined) {
    payload.model =
      input.model?.trim() || null;
  }

  if (
    input.serial_number !==
    undefined
  ) {
    payload.serial_number =
      input.serial_number?.trim() ||
      null;
  }

  if (
    input.condition_status !==
    undefined
  ) {
    payload.condition_status =
      input.condition_status;
  }

  if (
    input.operational_status !==
    undefined
  ) {
    payload.operational_status =
      input.operational_status;
  }

  if (
    input.acquisition_date !==
    undefined
  ) {
    payload.acquisition_date =
      input.acquisition_date || null;
  }

  if (
    input.replacement_value !==
    undefined
  ) {
    payload.replacement_value =
      input.replacement_value ??
      null;
  }

  if (input.notes !== undefined) {
    payload.notes =
      input.notes?.trim() || null;
  }

  if (
    Object.keys(payload).length === 0
  ) {
    const existing =
      await getResourceById(resourceId);

    if (!existing) {
      throw new Error(
        "Recurso não encontrado.",
      );
    }

    return existing;
  }

  payload.updated_at =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("resources")
    .update(payload)
    .eq(
      "resource_id",
      resourceId,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "updateResource error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return data as Resource;
}

/* -------------------------------------------------------------------------- */
/* Get by ID                                                                  */
/* -------------------------------------------------------------------------- */

export async function getResourceById(
  resourceId: string,
): Promise<Resource | null> {
  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("resources")
    .select("*")
    .eq(
      "resource_id",
      resourceId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "getResourceById error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return data as Resource | null;
}

/* -------------------------------------------------------------------------- */
/* Get details by ID                                                          */
/* -------------------------------------------------------------------------- */

export async function getResourceDetailsById(
  resourceId: string,
): Promise<ResourceDetails | null> {
  const supabase =
    await getSupabase();

  const {
    data: resource,
    error: resourceError,
  } = await supabase
    .from("resources")
    .select("*")
    .eq(
      "resource_id",
      resourceId,
    )
    .maybeSingle();

  if (resourceError) {
    console.error(
      "getResourceDetailsById resource error:",
      resourceError,
    );

    throw new Error(
      resourceError.message,
    );
  }

  if (!resource) {
    return null;
  }

  const {
    data: stock,
    error: stockError,
  } = await supabase
    .from("resource_stock")
    .select("*")
    .eq(
      "resource_id",
      resourceId,
    )
    .maybeSingle();

  if (stockError) {
    console.error(
      "getResourceDetailsById stock error:",
      stockError,
    );

    throw new Error(
      stockError.message,
    );
  }

  return {
    ...(resource as Resource),
    stock: stock
      ? ({
          ...stock,
          current_quantity:
            Number(
              stock.current_quantity,
            ),
          minimum_quantity:
            Number(
              stock.minimum_quantity,
            ),
          reserved_quantity:
            Number(
              stock.reserved_quantity,
            ),
          quantity_in_projects:
            Number(
              stock.quantity_in_projects,
            ),
          average_unit_cost:
            Number(
              stock.average_unit_cost,
            ),
        } as ResourceStock)
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Get all                                                                    */
/* -------------------------------------------------------------------------- */

export async function getResources(): Promise<
  Resource[]
> {
  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getResources error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return (data ?? []) as Resource[];
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

export async function getResourceStats(): Promise<
  ResourceStats
> {
  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("resources")
    .select(
      `
        resource_id,
        replacement_value,
        operational_status,
        condition_status
      `,
    );

  if (error) {
    console.error(
      "getResourceStats error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  const resources = data ?? [];

  return {
    totalResources:
      resources.length,

    totalReplacementValue:
      resources.reduce(
        (total, resource) =>
          total +
          Number(
            resource.replacement_value ??
              0,
          ),
        0,
      ),

    availableResources:
      resources.filter(
        (resource) =>
          resource.operational_status ===
          "available",
      ).length,

    resourcesInUse:
      resources.filter(
        (resource) =>
          resource.operational_status ===
          "in_use",
      ).length,

    resourcesInMaintenance:
      resources.filter(
        (resource) =>
          resource.condition_status ===
          "maintenance",
      ).length,

    missingResources:
      resources.filter(
        (resource) =>
          resource.operational_status ===
          "missing",
      ).length,

    damagedResources:
      resources.filter(
        (resource) =>
          resource.condition_status ===
          "damaged",
      ).length,
  };
}

/* -------------------------------------------------------------------------- */
/* Resource locations                                                         */
/* -------------------------------------------------------------------------- */

export async function getResourceLocations(): Promise<
  ResourceLocation[]
> {
  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("resource_locations")
    .select(
      `
        location_id,
        name,
        location_type,
        project_id,
        profile_id,
        supplier_id,
        notes
      `,
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getResourceLocations error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return (data ??
    []) as ResourceLocation[];
}

/* -------------------------------------------------------------------------- */
/* Recent movements                                                           */
/* -------------------------------------------------------------------------- */

export async function getRecentResourceMovements(
  limit = 10,
): Promise<ResourceMovement[]> {
  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("resource_movements")
    .select(
      `
        movement_id,
        resource_id,
        movement_type,
        quantity,
        unit,
        origin_location_id,
        destination_location_id,
        project_id,
        profile_id,
        movement_date,
        notes,
        created_by
      `,
    )
    .order("movement_date", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    console.error(
      "getRecentResourceMovements error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return enrichMovements(
    supabase,
    data ?? [],
  );
}

/* -------------------------------------------------------------------------- */
/* Resource movements                                                         */
/* -------------------------------------------------------------------------- */

export async function getResourceMovements(
  resourceId: string,
): Promise<ResourceMovement[]> {
  if (!resourceId) {
    return [];
  }

  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("resource_movements")
    .select(
      `
        movement_id,
        resource_id,
        movement_type,
        quantity,
        unit,
        origin_location_id,
        destination_location_id,
        project_id,
        profile_id,
        movement_date,
        notes,
        created_by
      `,
    )
    .eq(
      "resource_id",
      resourceId,
    )
    .order("movement_date", {
      ascending: false,
    });

  if (error) {
    console.error(
      "getResourceMovements error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(error.message);
  }

  return enrichMovements(
    supabase,
    data ?? [],
  );
}

/* -------------------------------------------------------------------------- */
/* Movement enrichment                                                        */
/* -------------------------------------------------------------------------- */

async function enrichMovements(
  supabase: Awaited<
    ReturnType<typeof getSupabase>
  >,
  movements: Array<{
    movement_id: string;
    resource_id: string;
    movement_type: string;
    quantity: number | null;
    unit: string | null;
    origin_location_id: string | null;
    destination_location_id: string | null;
    project_id: string | null;
    profile_id: string | null;
    movement_date: string;
    notes: string | null;
    created_by: string | null;
  }>,
): Promise<ResourceMovement[]> {
  if (!movements.length) {
    return [];
  }

  const resourceIds = [
    ...new Set(
      movements
        .map(
          (movement) =>
            movement.resource_id,
        )
        .filter(Boolean),
    ),
  ];

  const profileIds = [
    ...new Set(
      movements
        .flatMap((movement) => [
          movement.profile_id,
          movement.created_by,
        ])
        .filter(Boolean),
    ),
  ];

  const projectIds = [
    ...new Set(
      movements
        .map(
          (movement) =>
            movement.project_id,
        )
        .filter(Boolean),
    ),
  ];

  const locationIds = [
    ...new Set(
      movements
        .flatMap((movement) => [
          movement.origin_location_id,
          movement.destination_location_id,
        ])
        .filter(Boolean),
    ),
  ];

  const [
    resourcesResult,
    profilesResult,
    projectsResult,
    locationsResult,
  ] = await Promise.all([
    resourceIds.length
      ? supabase
          .from("resources")
          .select(
            "resource_id, name",
          )
          .in(
            "resource_id",
            resourceIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    profileIds.length
      ? supabase
          .from("profiles")
          .select(
            "profile_id, first_name, last_name",
          )
          .in(
            "profile_id",
            profileIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    projectIds.length
      ? supabase
          .from("projects")
          .select(
            "project_id, title",
          )
          .in(
            "project_id",
            projectIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    locationIds.length
      ? supabase
          .from("resource_locations")
          .select(
            "location_id, name",
          )
          .in(
            "location_id",
            locationIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  if (resourcesResult.error) {
    throw new Error(
      resourcesResult.error.message,
    );
  }

  if (profilesResult.error) {
    throw new Error(
      profilesResult.error.message,
    );
  }

  if (projectsResult.error) {
    throw new Error(
      projectsResult.error.message,
    );
  }

  if (locationsResult.error) {
    throw new Error(
      locationsResult.error.message,
    );
  }

  const resourceMap =
    new Map<string, string>(
      (resourcesResult.data ?? []).map(
        (resource) => [
          resource.resource_id,
          resource.name,
        ],
      ),
    );

  const profileMap =
    new Map<string, string>();

  for (
    const profile of
      profilesResult.data ?? []
  ) {
    const name = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    profileMap.set(
      profile.profile_id,
      name || "Utilizador",
    );
  }

  const projectMap =
    new Map<string, string>(
      (projectsResult.data ?? []).map(
        (project) => [
          project.project_id,
          project.title,
        ],
      ),
    );

  const locationMap =
    new Map<string, string>(
      (locationsResult.data ?? []).map(
        (location) => [
          location.location_id,
          location.name,
        ],
      ),
    );

  return movements.map(
    (movement) => ({
      movement_id:
        movement.movement_id,

      movement_date:
        movement.movement_date,

      movement_type:
        movement.movement_type as ResourceMovementType,

      resource_id:
        movement.resource_id,

      resource_name:
        resourceMap.get(
          movement.resource_id,
        ) ??
        "Recurso desconhecido",

      quantity:
        movement.quantity !== null
          ? Number(
              movement.quantity,
            )
          : null,

      unit: movement.unit,

      origin_location_id:
        movement.origin_location_id,

      origin_location_name:
        movement.origin_location_id
          ? locationMap.get(
              movement.origin_location_id,
            ) ?? null
          : null,

      destination_location_id:
        movement.destination_location_id,

      destination_location_name:
        movement.destination_location_id
          ? locationMap.get(
              movement.destination_location_id,
            ) ?? null
          : null,

      project_id:
        movement.project_id,

      project_name:
        movement.project_id
          ? projectMap.get(
              movement.project_id,
            ) ?? null
          : null,

      profile_id:
        movement.profile_id,

      profile_name:
        movement.profile_id
          ? profileMap.get(
              movement.profile_id,
            ) ?? null
          : null,

      created_by:
        movement.created_by,

      created_by_name:
        movement.created_by
          ? profileMap.get(
              movement.created_by,
            ) ?? null
          : null,

      notes: movement.notes,
    }),
  );
}