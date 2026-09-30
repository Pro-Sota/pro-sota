import "server-only";

import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

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

/* -------------------------------------------------------------------------- */
/* Resource                                                                   */
/* -------------------------------------------------------------------------- */

export type Resource = {
  resource_id: string;

  resource_code: string;
  name: string;
  description: string | null;

  resource_type: ResourceType;
  category: string | null;

  brand: string | null;
  model: string | null;
  serial_number: string | null;
  asset_tag: string | null;

  unit_of_measure: UnitOfMeasure | null;

  condition_status: ResourceCondition;
  operational_status: ResourceOperationalStatus;

  acquisition_date: string | null;
  acquisition_value: number | null;
  replacement_value: number | null;

  notes: string | null;

  created_by: string | null;
  updated_by: string | null;

  created_at: string;
  updated_at: string;

  /*
   * Optional enriched fields.
   * These are not columns in public.resources.
   * They can be populated by joins or related services.
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

/* -------------------------------------------------------------------------- */
/* Resource movement                                                          */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Resource statistics                                                        */
/* -------------------------------------------------------------------------- */

export type ResourceStats = {
  totalResources: number;
  totalReplacementValue: number;
  availableResources: number;
  resourcesInUse: number;
  resourcesInMaintenance: number;
  missingResources: number;
  damagedResources: number;
};

/* -------------------------------------------------------------------------- */
/* Resource stock                                                             */
/* -------------------------------------------------------------------------- */

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

export type ResourceStockInput = {
  unit: string | null;

  current_quantity: number;
  minimum_quantity: number;
  reserved_quantity?: number;
  quantity_in_projects?: number;

  average_unit_cost: number;

  warehouse_id: string | null;
  supplier_id: string | null;

  batch_number: string | null;
  expiry_date: string | null;
};

/* -------------------------------------------------------------------------- */
/* Resource details                                                           */
/* -------------------------------------------------------------------------- */

export type ResourceDetails = Resource & {
  stock: ResourceStock | null;
};

/* -------------------------------------------------------------------------- */
/* Resource location                                                          */
/* -------------------------------------------------------------------------- */

export type ResourceLocation = {
  location_id: string;
  name: string;
  location_type: ResourceLocationType;

  project_id: string | null;
  profile_id: string | null;
  supplier_id: string | null;

  notes: string | null;
};

/* -------------------------------------------------------------------------- */
/* Resource form input                                                        */
/* -------------------------------------------------------------------------- */

/*
 * This type now matches the new public.resources table.
 *
 * Stock, batch, supplier, maintenance and location information
 * are intentionally not part of resource creation.
 */
export type ResourceFormInput = {
  resource_code: string;
  name: string;
  description: string | null;

  resource_type: ResourceType;
  category: string | null;

  brand: string | null;
  model: string | null;
  serial_number: string | null;
  asset_tag: string | null;

  unit_of_measure: UnitOfMeasure | null;

  condition_status: ResourceCondition;
  operational_status: ResourceOperationalStatus;

  acquisition_date: string | null;
  acquisition_value: number | null;
  replacement_value: number | null;

  notes: string | null;
};

export type CreateResourceInput = ResourceFormInput;

/* -------------------------------------------------------------------------- */
/* Resource update input                                                      */
/* -------------------------------------------------------------------------- */

export type UpdateResourceInput = Partial<ResourceFormInput>;

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
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeNullableString(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
}

function normalizeMoney(
  value: number | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isFinite(value)) {
    throw new Error(
      "O valor monetário indicado é inválido.",
    );
  }

  if (value < 0) {
    throw new Error(
      "Os valores monetários não podem ser negativos.",
    );
  }

  return value;
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

  const name =
    input.name.trim();

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

  const acquisitionValue =
    normalizeMoney(
      input.acquisition_value,
    );

  const replacementValue =
    normalizeMoney(
      input.replacement_value,
    );

  const {
    data,
    error,
  } = await supabase
    .from("resources")
    .insert({
      resource_code: resourceCode,
      name,

      description:
        normalizeNullableString(
          input.description,
        ),

      resource_type:
        input.resource_type,

      category:
        normalizeNullableString(
          input.category,
        ),

      brand:
        normalizeNullableString(
          input.brand,
        ),

      model:
        normalizeNullableString(
          input.model,
        ),

      serial_number:
        normalizeNullableString(
          input.serial_number,
        ),

      asset_tag:
        normalizeNullableString(
          input.asset_tag,
        ),

      unit_of_measure:
        input.unit_of_measure || null,

      condition_status:
        input.condition_status ??
        "operational",

      operational_status:
        input.operational_status ??
        "available",

      acquisition_date:
        input.acquisition_date || null,

      acquisition_value:
        acquisitionValue,

      replacement_value:
        replacementValue,

      notes:
        normalizeNullableString(
          input.notes,
        ),

      created_by: user.id,
      updated_by: user.id,
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

    if (error.code === "23505") {
      throw new Error(
        "Já existe um recurso com este código ou etiqueta patrimonial.",
      );
    }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Utilizador não autenticado.",
    );
  }

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
    input.resource_code !==
    undefined
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
    input.description !==
    undefined
  ) {
    payload.description =
      normalizeNullableString(
        input.description,
      );
  }

  if (
    input.resource_type !==
    undefined
  ) {
    payload.resource_type =
      input.resource_type;
  }

  if (
    input.category !==
    undefined
  ) {
    payload.category =
      normalizeNullableString(
        input.category,
      );
  }

  if (input.brand !== undefined) {
    payload.brand =
      normalizeNullableString(
        input.brand,
      );
  }

  if (input.model !== undefined) {
    payload.model =
      normalizeNullableString(
        input.model,
      );
  }

  if (
    input.serial_number !==
    undefined
  ) {
    payload.serial_number =
      normalizeNullableString(
        input.serial_number,
      );
  }

  if (
    input.asset_tag !==
    undefined
  ) {
    payload.asset_tag =
      normalizeNullableString(
        input.asset_tag,
      );
  }

  if (
    input.unit_of_measure !==
    undefined
  ) {
    payload.unit_of_measure =
      input.unit_of_measure || null;
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
    input.acquisition_value !==
    undefined
  ) {
    payload.acquisition_value =
      normalizeMoney(
        input.acquisition_value,
      );
  }

  if (
    input.replacement_value !==
    undefined
  ) {
    payload.replacement_value =
      normalizeMoney(
        input.replacement_value,
      );
  }

  if (input.notes !== undefined) {
    payload.notes =
      normalizeNullableString(
        input.notes,
      );
  }

  if (
    Object.keys(payload).length ===
    0
  ) {
    const existing =
      await getResourceById(
        resourceId,
      );

    if (!existing) {
      throw new Error(
        "Recurso não encontrado.",
      );
    }

    return existing;
  }

  payload.updated_by = user.id;

  /*
   * The database trigger also updates updated_at.
   * Setting it here keeps the service safe even if the
   * trigger has not yet been deployed.
   */
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

    if (error.code === "23505") {
      throw new Error(
        "Já existe um recurso com este código ou etiqueta patrimonial.",
      );
    }

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
  if (!resourceId) {
    return null;
  }

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
  if (!resourceId) {
    return null;
  }

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

  /*
   * Stock remains separate from resources.
   * This is important after the new schema change.
   */
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
            stock.current_quantity ??
            0,
          ),

        minimum_quantity:
          Number(
            stock.minimum_quantity ??
            0,
          ),

        reserved_quantity:
          Number(
            stock.reserved_quantity ??
            0,
          ),

        quantity_in_projects:
          Number(
            stock.quantity_in_projects ??
            0,
          ),

        average_unit_cost:
          Number(
            stock.average_unit_cost ??
            0,
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


export async function getResourceLocations(): Promise<ResourceLocation[]> {
  const supabase =
    await getSupabase();

  const { data, error } = await supabase
    .from("resource_locations")
    .select(`
      location_id,
      name,
      location_type,
      project_id,
      profile_id,
      supplier_id,
      notes,
      created_at
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("getResourceLocations error:", error);
    throw new Error("Não foi possível carregar as localizações.");
  }

  return data ?? [];
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


export type ResourceMovementProjectOption = {
  project_id: string;
  project_code: string | null;
  title: string;
  municipality: string | null;
  status: string | null;
};

export async function getProjectsForResourceMovement(): Promise<
  ResourceMovementProjectOption[]
> {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from("projects")
      .select(`
        project_id,
        project_code,
        title,
        municipality,
        status
      `)
      .order("title", { ascending: true });

    if (error) {
      console.error(
        "getProjectsForResourceMovement error:",
        error,
      );

      throw new Error(
        "Não foi possível carregar as obras.",
      );
    }

    return data ?? [];
  } catch (error) {
    console.error(
      "getProjectsForResourceMovement error:",
      error,
    );

    throw error;
  }
}

export type ResourceMovementFormInput = {
  resource_id: string;
  movement_type: ResourceMovementType;
  quantity: number | null;
  origin_location_id: string | null;
  destination_location_id: string | null;
  project_id: string | null;
  profile_id: string | null;
  notes: string | null;
};

export async function createResourceMovement(
  input: ResourceMovementFormInput,
) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  if (!input.resource_id) {
    throw new Error("O recurso é obrigatório.");
  }

  if (!input.movement_type) {
    throw new Error(
      "O tipo de movimentação é obrigatório.",
    );
  }

  if (
    input.quantity !== null &&
    (!Number.isFinite(input.quantity) ||
      input.quantity <= 0)
  ) {
    throw new Error(
      "A quantidade deve ser superior a zero.",
    );
  }

  if (
    input.movement_type === "transfer" &&
    !input.origin_location_id
  ) {
    throw new Error(
      "A origem é obrigatória para uma transferência.",
    );
  }

  if (
    input.movement_type === "transfer" &&
    !input.destination_location_id
  ) {
    throw new Error(
      "O destino é obrigatório para uma transferência.",
    );
  }

  if (
    input.origin_location_id &&
    input.destination_location_id &&
    input.origin_location_id ===
      input.destination_location_id
  ) {
    throw new Error(
      "A origem e o destino não podem ser iguais.",
    );
  }

  if (
    input.movement_type === "consumption" &&
    !input.project_id
  ) {
    throw new Error(
      "A obra é obrigatória para um consumo.",
    );
  }

  const { data, error } = await supabase
    .from("resource_movements")
    .insert({
      resource_id: input.resource_id,
      movement_type: input.movement_type,
      quantity: input.quantity,
      origin_location_id:
        input.origin_location_id,
      destination_location_id:
        input.destination_location_id,
      project_id: input.project_id,
      profile_id: input.profile_id,
      notes: input.notes,
    })
    .select(`
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
    `)
    .single();

  if (error) {
    console.error(
      "createResourceMovement error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(
      `Não foi possível registar a movimentação: ${error.message}`,
    );
  }

  return data;
}

export type ResourceMovementProfileOption = {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
};

export async function getProfilesForResourceMovement(): Promise<
  ResourceMovementProfileOption[]
> {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        profile_id,
        first_name,
        last_name
      `)
      .order("first_name", { ascending: true })
      .order("last_name", { ascending: true });

    if (error) {
      console.error(
        "getProfilesForResourceMovement error:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      );

      throw new Error(
        `Não foi possível carregar os colaboradores: ${error.message}`,
      );
    }

    return data ?? [];
  } catch (error) {
    console.error(
      "getProfilesForResourceMovement failed:",
      error,
    );

    throw error;
  }
}