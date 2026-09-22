import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

/* =========================================================
   Types
   ========================================================= */

export type ResourceType =
    | "material"
    | "equipment"
    | "tool"
    | "ppe"
    | "vehicle";

export type ConditionStatus =
    | "operational"
    | "restricted"
    | "maintenance"
    | "damaged"
    | "retired";

export type OperationalStatus =
    | "available"
    | "in_use"
    | "overdue"
    | "missing";

export type LocationType =
    | "warehouse"
    | "office"
    | "project"
    | "employee"
    | "supplier";

export type MovementType =
    | "entry"
    | "exit"
    | "transfer"
    | "return"
    | "consumption"
    | "maintenance"
    | "retirement";

export type MaintenanceType =
    | "preventive"
    | "corrective"
    | "inspection"
    | "other";

export type AttachmentType =
    | "photo"
    | "delivery_term"
    | "invoice"
    | "maintenance_document"
    | "manual"
    | "other";

export type Resource = {
    resource_id: string;
    resource_code: string;
    name: string;
    resource_type: ResourceType;
    category: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    condition_status: ConditionStatus;
    operational_status: OperationalStatus;
    acquisition_date: string | null;
    replacement_value: number | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
};

export type ResourceLocation = {
    location_id: string;
    name: string;
    location_type: LocationType;
    project_id: string | null;
    profile_id: string | null;
    supplier_id: string | null;
    notes: string | null;
    created_at: string;
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

export type ResourceAssignment = {
    assignment_id: string;
    resource_id: string;
    profile_id: string | null;
    project_id: string | null;
    location_id: string | null;
    assigned_at: string;
    expected_return_at: string | null;
    returned_at: string | null;
    delivery_condition: string | null;
    return_condition: string | null;
    received_confirmed: boolean;
    received_at: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
};

export type ResourceMovement = {
    movement_id: string;
    resource_id: string;
    movement_type: MovementType;
    quantity: number | null;
    unit: string | null;
    origin_location_id: string | null;
    destination_location_id: string | null;
    project_id: string | null;
    profile_id: string | null;
    movement_date: string;
    notes: string | null;
    created_by: string | null;
    created_at: string;
};

export type ResourceMaintenance = {
    maintenance_id: string;
    resource_id: string;
    maintenance_type: MaintenanceType;
    description: string | null;
    scheduled_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    supplier_id: string | null;
    cost: number | null;
    condition_before: string | null;
    condition_after: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
};

export type ResourceDeliveryTerm = {
    delivery_id: string;
    resource_id: string;
    assignment_id: string | null;
    delivered_at: string;
    condition: string | null;
    document_url: string | null;
    photo_url: string | null;
    accepted: boolean;
    accepted_at: string | null;
    accepted_by: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
};

export type ResourceAttachment = {
    attachment_id: string;
    resource_id: string;
    file_name: string;
    file_url: string;
    file_type: string | null;
    attachment_type: AttachmentType;
    uploaded_by: string | null;
    created_at: string;
};

export type ProjectResourceStock = {
    project_stock_id: string;
    project_id: string;
    resource_id: string;
    quantity: number;
    reserved_quantity: number;
    consumed_quantity: number;
    updated_at: string;
};

/* =========================================================
   Input types
   ========================================================= */

export type CreateResourceInput = {
    operational_status: string;
    created_by: null;
    resource_code: string;
    name: string;

    resource_type:
    | "material"
    | "equipment"
    | "tool"
    | "ppe"
    | "vehicle";

    category?: string | null;
    brand?: string | null;
    model?: string | null;
    serial_number?: string | null;

    condition_status:
    | "operational"
    | "restricted"
    | "maintenance"
    | "damaged"
    | "retired";

    acquisition_date?: string | null;
    replacement_value?: number | null;

    supplier_id?: string | null;
    notes?: string | null;

    stock?: {
        unit:
        | "unidade"
        | "saco"
        | "kg"
        | "tonelada"
        | "m³"
        | "m"
        | "caixa"
        | "litro";

        current_quantity: number;
        minimum_quantity: number;
        average_unit_cost: number;

        batch_number?: string | null;
        expiry_date?: string | null;
    } | null;
};


export type UpdateResourceInput = Partial<
    Omit<
        Resource,
        "resource_id" | "created_at" | "updated_at"
    >
>;

export type CreateLocationInput = {
    name: string;
    location_type: LocationType;
    project_id?: string | null;
    profile_id?: string | null;
    supplier_id?: string | null;
    notes?: string | null;
};

export type UpdateLocationInput = Partial<
    Omit<ResourceLocation, "location_id" | "created_at">
>;

export type CreateStockInput = {
    resource_id: string;
    unit: string;
    current_quantity?: number;
    minimum_quantity?: number;
    reserved_quantity?: number;
    quantity_in_projects?: number;
    average_unit_cost?: number;
    warehouse_id?: string | null;
    supplier_id?: string | null;
    batch_number?: string | null;
    expiry_date?: string | null;
};

export type UpdateStockInput = Partial<
    Omit<ResourceStock, "stock_id" | "resource_id" | "created_at" | "updated_at">
>;

export type CreateAssignmentInput = {
    resource_id: string;
    profile_id?: string | null;
    project_id?: string | null;
    location_id?: string | null;
    assigned_at?: string;
    expected_return_at?: string | null;
    delivery_condition?: string | null;
    notes?: string | null;
    created_by?: string | null;
};

export type ReturnAssignmentInput = {
    assignment_id: string;
    returned_at?: string;
    return_condition?: string | null;
};

export type CreateMovementInput = {
    resource_id: string;
    movement_type: MovementType;
    quantity?: number | null;
    unit?: string | null;
    origin_location_id?: string | null;
    destination_location_id?: string | null;
    project_id?: string | null;
    profile_id?: string | null;
    movement_date?: string;
    notes?: string | null;
    created_by?: string | null;
};

export type CreateMaintenanceInput = {
    resource_id: string;
    maintenance_type: MaintenanceType;
    description?: string | null;
    scheduled_date?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    supplier_id?: string | null;
    cost?: number | null;
    condition_before?: string | null;
    condition_after?: string | null;
    notes?: string | null;
    created_by?: string | null;
};

export type UpdateMaintenanceInput = Partial<
    Omit<
        ResourceMaintenance,
        "maintenance_id" | "resource_id" | "created_at"
    >
>;

export type CreateDeliveryTermInput = {
    resource_id: string;
    assignment_id?: string | null;
    delivered_at?: string;
    condition?: string | null;
    document_url?: string | null;
    photo_url?: string | null;
    accepted?: boolean;
    accepted_at?: string | null;
    accepted_by?: string | null;
    notes?: string | null;
    created_by?: string | null;
};

export type CreateAttachmentInput = {
    resource_id: string;
    file_name: string;
    file_url: string;
    file_type?: string | null;
    attachment_type?: AttachmentType;
    uploaded_by?: string | null;
};

export type UpsertProjectStockInput = {
    project_id: string;
    resource_id: string;
    quantity?: number;
    reserved_quantity?: number;
    consumed_quantity?: number;
};

/* =========================================================
   Helpers
   ========================================================= */

/* -------------------------------------------------------------------------- */
/* Create resource                                                            */
/* -------------------------------------------------------------------------- */


async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

function normalizeError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }

    if (typeof error === "object" && error !== null) {
        const candidate = error as {
            message?: string;
            details?: string;
            hint?: string;
        };

        const message = [
            candidate.message,
            candidate.details,
            candidate.hint,
        ]
            .filter(Boolean)
            .join(" — ");

        if (message) {
            return new Error(message);
        }
    }

    return new Error("Ocorreu um erro inesperado.");
}

/* =========================================================
   Resources
   ========================================================= */

export async function getResources(): Promise<Resource[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("getResources error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as Resource[];
}

export async function getResourcesByType(
    resourceType: ResourceType
): Promise<Resource[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_type", resourceType)
        .order("name", { ascending: true });

    if (error) {
        console.error("getResourcesByType error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as Resource[];
}

export async function getResourceById(
    resourceId: string
): Promise<Resource | null> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_id", resourceId)
        .maybeSingle();

    if (error) {
        console.error("getResourceById error:", error);
        throw normalizeError(error);
    }

    return data as Resource | null;
}

export async function getResourceByCode(
    resourceCode: string
): Promise<Resource | null> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("resource_code", resourceCode)
        .maybeSingle();

    if (error) {
        console.error("getResourceByCode error:", error);
        throw normalizeError(error);
    }

    return data as Resource | null;
}

export async function createResource(
    input: CreateResourceInput
): Promise<Resource> {
    const supabase = await getSupabase();

    const payload = {
        resource_code: input.resource_code.trim(),
        name: input.name.trim(),
        resource_type: input.resource_type,
        category: input.category?.trim() || null,
        brand: input.brand?.trim() || null,
        model: input.model?.trim() || null,
        serial_number: input.serial_number?.trim() || null,
        condition_status: input.condition_status ?? "operational",
        operational_status: input.operational_status ?? "available",
        acquisition_date: input.acquisition_date || null,
        replacement_value: input.replacement_value ?? null,
        notes: input.notes?.trim() || null,
        created_by: input.created_by ?? null,
    };

    const { data, error } = await supabase
        .from("resources")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResource error:", error);
        throw normalizeError(error);
    }

    return data as Resource;
}

export async function updateResource(
    resourceId: string,
    input: UpdateResourceInput
): Promise<Resource> {
    const supabase = await getSupabase();

    const payload: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
    };

    if (typeof payload.name === "string") {
        payload.name = payload.name.trim();
    }

    if (typeof payload.resource_code === "string") {
        payload.resource_code = payload.resource_code.trim();
    }

    const { data, error } = await supabase
        .from("resources")
        .update(payload)
        .eq("resource_id", resourceId)
        .select("*")
        .single();

    if (error) {
        console.error("updateResource error:", error);
        throw normalizeError(error);
    }

    return data as Resource;
}

export async function deleteResource(
    resourceId: string
): Promise<void> {
    const supabase = await getSupabase();

    const { error } = await supabase
        .from("resources")
        .delete()
        .eq("resource_id", resourceId);

    if (error) {
        console.error("deleteResource error:", error);
        throw normalizeError(error);
    }
}

/* =========================================================
   Locations
   ========================================================= */

export async function getResourceLocations(): Promise<
    ResourceLocation[]
> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_locations")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("getResourceLocations error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceLocation[];
}

export async function getResourceLocationById(
    locationId: string
): Promise<ResourceLocation | null> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_locations")
        .select("*")
        .eq("location_id", locationId)
        .maybeSingle();

    if (error) {
        console.error("getResourceLocationById error:", error);
        throw normalizeError(error);
    }

    return data as ResourceLocation | null;
}

export async function createResourceLocation(
    input: CreateLocationInput
): Promise<ResourceLocation> {
    const supabase = await getSupabase();

    const payload = {
        name: input.name.trim(),
        location_type: input.location_type,
        project_id: input.project_id ?? null,
        profile_id: input.profile_id ?? null,
        supplier_id: input.supplier_id ?? null,
        notes: input.notes?.trim() || null,
    };

    const { data, error } = await supabase
        .from("resource_locations")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceLocation error:", error);
        throw normalizeError(error);
    }

    return data as ResourceLocation;
}

export async function updateResourceLocation(
    locationId: string,
    input: UpdateLocationInput
): Promise<ResourceLocation> {
    const supabase = await getSupabase();

    const payload = { ...input };

    if (typeof payload.name === "string") {
        payload.name = payload.name.trim();
    }

    const { data, error } = await supabase
        .from("resource_locations")
        .update(payload)
        .eq("location_id", locationId)
        .select("*")
        .single();

    if (error) {
        console.error("updateResourceLocation error:", error);
        throw normalizeError(error);
    }

    return data as ResourceLocation;
}

export async function deleteResourceLocation(
    locationId: string
): Promise<void> {
    const supabase = await getSupabase();

    const { error } = await supabase
        .from("resource_locations")
        .delete()
        .eq("location_id", locationId);

    if (error) {
        console.error("deleteResourceLocation error:", error);
        throw normalizeError(error);
    }
}

/* =========================================================
   Stock
   ========================================================= */

export async function getResourceStock(
    resourceId: string
): Promise<ResourceStock | null> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_stock")
        .select("*")
        .eq("resource_id", resourceId)
        .maybeSingle();

    if (error) {
        console.error("getResourceStock error:", error);
        throw normalizeError(error);
    }

    return data as ResourceStock | null;
}

export async function getAllResourceStock(): Promise<ResourceStock[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_stock")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("getAllResourceStock error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceStock[];
}

export async function getLowStockResources(): Promise<ResourceStock[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_stock")
        .select("*")
        .filter("current_quantity", "lte", "minimum_quantity")
        .order("current_quantity", { ascending: true });

    if (error) {
        console.error("getLowStockResources error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceStock[];
}

export async function createResourceStock(
    input: CreateStockInput
): Promise<ResourceStock> {
    const supabase = await getSupabase();

    const payload = {
        resource_id: input.resource_id,
        unit: input.unit.trim(),
        current_quantity: input.current_quantity ?? 0,
        minimum_quantity: input.minimum_quantity ?? 0,
        reserved_quantity: input.reserved_quantity ?? 0,
        quantity_in_projects: input.quantity_in_projects ?? 0,
        average_unit_cost: input.average_unit_cost ?? 0,
        warehouse_id: input.warehouse_id ?? null,
        supplier_id: input.supplier_id ?? null,
        batch_number: input.batch_number?.trim() || null,
        expiry_date: input.expiry_date || null,
    };

    const { data, error } = await supabase
        .from("resource_stock")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceStock error:", error);
        throw normalizeError(error);
    }

    return data as ResourceStock;
}

export async function updateResourceStock(
    resourceId: string,
    input: UpdateStockInput
): Promise<ResourceStock> {
    const supabase = await getSupabase();

    const payload = {
        ...input,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("resource_stock")
        .update(payload)
        .eq("resource_id", resourceId)
        .select("*")
        .single();

    if (error) {
        console.error("updateResourceStock error:", error);
        throw normalizeError(error);
    }

    return data as ResourceStock;
}

/* =========================================================
   Assignments
   ========================================================= */

export async function getResourceAssignments(
    resourceId: string
): Promise<ResourceAssignment[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_assignments")
        .select("*")
        .eq("resource_id", resourceId)
        .order("assigned_at", { ascending: false });

    if (error) {
        console.error("getResourceAssignments error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceAssignment[];
}

export async function getActiveResourceAssignments(): Promise<
    ResourceAssignment[]
> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_assignments")
        .select("*")
        .is("returned_at", null)
        .order("assigned_at", { ascending: false });

    if (error) {
        console.error("getActiveResourceAssignments error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceAssignment[];
}

export async function getOverdueResourceAssignments(): Promise<
    ResourceAssignment[]
> {
    const supabase = await getSupabase();

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("resource_assignments")
        .select("*")
        .is("returned_at", null)
        .lt("expected_return_at", now)
        .order("expected_return_at", { ascending: true });

    if (error) {
        console.error("getOverdueResourceAssignments error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceAssignment[];
}

export async function createResourceAssignment(
    input: CreateAssignmentInput
): Promise<ResourceAssignment> {
    const supabase = await getSupabase();

    const payload = {
        resource_id: input.resource_id,
        profile_id: input.profile_id ?? null,
        project_id: input.project_id ?? null,
        location_id: input.location_id ?? null,
        assigned_at: input.assigned_at ?? new Date().toISOString(),
        expected_return_at: input.expected_return_at ?? null,
        delivery_condition: input.delivery_condition?.trim() || null,
        notes: input.notes?.trim() || null,
        created_by: input.created_by ?? null,
    };

    const { data, error } = await supabase
        .from("resource_assignments")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceAssignment error:", error);
        throw normalizeError(error);
    }

    return data as ResourceAssignment;
}

export async function returnResourceAssignment(
    input: ReturnAssignmentInput
): Promise<ResourceAssignment> {
    const supabase = await getSupabase();

    const returnedAt =
        input.returned_at ?? new Date().toISOString();

    const { data, error } = await supabase
        .from("resource_assignments")
        .update({
            returned_at: returnedAt,
            return_condition: input.return_condition?.trim() || null,
        })
        .eq("assignment_id", input.assignment_id)
        .select("*")
        .single();

    if (error) {
        console.error("returnResourceAssignment error:", error);
        throw normalizeError(error);
    }

    return data as ResourceAssignment;
}

export async function confirmResourceAssignmentReceipt(
    assignmentId: string
): Promise<ResourceAssignment> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_assignments")
        .update({
            received_confirmed: true,
            received_at: new Date().toISOString(),
        })
        .eq("assignment_id", assignmentId)
        .select("*")
        .single();

    if (error) {
        console.error(
            "confirmResourceAssignmentReceipt error:",
            error
        );
        throw normalizeError(error);
    }

    return data as ResourceAssignment;
}

/* =========================================================
   Movements
   ========================================================= */

export async function getResourceMovements(
    resourceId: string
): Promise<ResourceMovement[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_movements")
        .select("*")
        .eq("resource_id", resourceId)
        .order("movement_date", { ascending: false });

    if (error) {
        console.error("getResourceMovements error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceMovement[];
}

export async function getRecentResourceMovements(
    limit = 10
): Promise<ResourceMovement[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_movements")
        .select("*")
        .order("movement_date", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("getRecentResourceMovements error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceMovement[];
}

export async function createResourceMovement(
    input: CreateMovementInput
): Promise<ResourceMovement> {
    const supabase = await getSupabase();

    const payload = {
        resource_id: input.resource_id,
        movement_type: input.movement_type,
        quantity: input.quantity ?? null,
        unit: input.unit?.trim() || null,
        origin_location_id: input.origin_location_id ?? null,
        destination_location_id:
            input.destination_location_id ?? null,
        project_id: input.project_id ?? null,
        profile_id: input.profile_id ?? null,
        movement_date:
            input.movement_date ?? new Date().toISOString(),
        notes: input.notes?.trim() || null,
        created_by: input.created_by ?? null,
    };

    const { data, error } = await supabase
        .from("resource_movements")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceMovement error:", error);
        throw normalizeError(error);
    }

    return data as ResourceMovement;
}

/* =========================================================
   Maintenance
   ========================================================= */

export async function getResourceMaintenance(
    resourceId: string
): Promise<ResourceMaintenance[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_maintenance")
        .select("*")
        .eq("resource_id", resourceId)
        .order("scheduled_date", { ascending: false });

    if (error) {
        console.error("getResourceMaintenance error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceMaintenance[];
}

export async function getUpcomingMaintenance(
    limit = 10
): Promise<ResourceMaintenance[]> {
    const supabase = await getSupabase();

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from("resource_maintenance")
        .select("*")
        .gte("scheduled_date", today)
        .order("scheduled_date", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("getUpcomingMaintenance error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceMaintenance[];
}

export async function createResourceMaintenance(
    input: CreateMaintenanceInput
): Promise<ResourceMaintenance> {
    const supabase = await getSupabase();

    const payload = {
        resource_id: input.resource_id,
        maintenance_type: input.maintenance_type,
        description: input.description?.trim() || null,
        scheduled_date: input.scheduled_date || null,
        started_at: input.started_at ?? null,
        completed_at: input.completed_at ?? null,
        supplier_id: input.supplier_id ?? null,
        cost: input.cost ?? null,
        condition_before: input.condition_before?.trim() || null,
        condition_after: input.condition_after?.trim() || null,
        notes: input.notes?.trim() || null,
        created_by: input.created_by ?? null,
    };

    const { data, error } = await supabase
        .from("resource_maintenance")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceMaintenance error:", error);
        throw normalizeError(error);
    }

    return data as ResourceMaintenance;
}

export async function updateResourceMaintenance(
    maintenanceId: string,
    input: UpdateMaintenanceInput
): Promise<ResourceMaintenance> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_maintenance")
        .update(input)
        .eq("maintenance_id", maintenanceId)
        .select("*")
        .single();

    if (error) {
        console.error("updateResourceMaintenance error:", error);
        throw normalizeError(error);
    }

    return data as ResourceMaintenance;
}

/* =========================================================
   Delivery Terms
   ========================================================= */

export async function getResourceDeliveryTerms(
    resourceId: string
): Promise<ResourceDeliveryTerm[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_delivery_terms")
        .select("*")
        .eq("resource_id", resourceId)
        .order("delivered_at", { ascending: false });

    if (error) {
        console.error("getResourceDeliveryTerms error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceDeliveryTerm[];
}

export async function createResourceDeliveryTerm(
    input: CreateDeliveryTermInput
): Promise<ResourceDeliveryTerm> {
    const supabase = await getSupabase();

    const payload = {
        resource_id: input.resource_id,
        assignment_id: input.assignment_id ?? null,
        delivered_at:
            input.delivered_at ?? new Date().toISOString(),
        condition: input.condition?.trim() || null,
        document_url: input.document_url ?? null,
        photo_url: input.photo_url ?? null,
        accepted: input.accepted ?? false,
        accepted_at: input.accepted_at ?? null,
        accepted_by: input.accepted_by ?? null,
        notes: input.notes?.trim() || null,
        created_by: input.created_by ?? null,
    };

    const { data, error } = await supabase
        .from("resource_delivery_terms")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceDeliveryTerm error:", error);
        throw normalizeError(error);
    }

    return data as ResourceDeliveryTerm;
}

export async function acceptResourceDeliveryTerm(
    deliveryId: string,
    acceptedBy: string
): Promise<ResourceDeliveryTerm> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_delivery_terms")
        .update({
            accepted: true,
            accepted_at: new Date().toISOString(),
            accepted_by: acceptedBy,
        })
        .eq("delivery_id", deliveryId)
        .select("*")
        .single();

    if (error) {
        console.error("acceptResourceDeliveryTerm error:", error);
        throw normalizeError(error);
    }

    return data as ResourceDeliveryTerm;
}

/* =========================================================
   Attachments
   ========================================================= */

export async function getResourceAttachments(
    resourceId: string
): Promise<ResourceAttachment[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("resource_attachments")
        .select("*")
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getResourceAttachments error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ResourceAttachment[];
}

export async function createResourceAttachment(
    input: CreateAttachmentInput
): Promise<ResourceAttachment> {
    const supabase = await getSupabase();

    const payload = {
        resource_id: input.resource_id,
        file_name: input.file_name.trim(),
        file_url: input.file_url,
        file_type: input.file_type?.trim() || null,
        attachment_type: input.attachment_type ?? "other",
        uploaded_by: input.uploaded_by ?? null,
    };

    const { data, error } = await supabase
        .from("resource_attachments")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        console.error("createResourceAttachment error:", error);
        throw normalizeError(error);
    }

    return data as ResourceAttachment;
}

export async function deleteResourceAttachment(
    attachmentId: string
): Promise<void> {
    const supabase = await getSupabase();

    const { error } = await supabase
        .from("resource_attachments")
        .delete()
        .eq("attachment_id", attachmentId);

    if (error) {
        console.error("deleteResourceAttachment error:", error);
        throw normalizeError(error);
    }
}

/* =========================================================
   Project Resource Stock
   ========================================================= */

export async function getProjectResourceStock(
    projectId: string
): Promise<ProjectResourceStock[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_resource_stock")
        .select("*")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("getProjectResourceStock error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ProjectResourceStock[];
}

export async function getResourceProjectStock(
    resourceId: string
): Promise<ProjectResourceStock[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_resource_stock")
        .select("*")
        .eq("resource_id", resourceId)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("getResourceProjectStock error:", error);
        throw normalizeError(error);
    }

    return (data ?? []) as ProjectResourceStock[];
}

export async function upsertProjectResourceStock(
    input: UpsertProjectStockInput
): Promise<ProjectResourceStock> {
    const supabase = await getSupabase();

    const payload = {
        project_id: input.project_id,
        resource_id: input.resource_id,
        quantity: input.quantity ?? 0,
        reserved_quantity: input.reserved_quantity ?? 0,
        consumed_quantity: input.consumed_quantity ?? 0,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("project_resource_stock")
        .upsert(payload, {
            onConflict: "project_id,resource_id",
        })
        .select("*")
        .single();

    if (error) {
        console.error("upsertProjectResourceStock error:", error);
        throw normalizeError(error);
    }

    return data as ProjectResourceStock;
}

/* =========================================================
   Dashboard / Statistics
   ========================================================= */

export type ResourceStats = {
    totalResources: number;
    totalMaterials: number;
    totalEquipment: number;
    totalTools: number;
    totalPpe: number;
    totalVehicles: number;
    available: number;
    inUse: number;
    overdue: number;
    missing: number;
    inMaintenance: number;
    totalStockValue: number;
    lowStockCount: number;
};

export async function getResourceStats(): Promise<ResourceStats> {
    const supabase = await getSupabase();

    const [resourcesResult, stockResult] = await Promise.all([
        supabase
            .from("resources")
            .select(
                "resource_id,resource_type,condition_status,operational_status"
            ),

        supabase
            .from("resource_stock")
            .select(
                "resource_id,current_quantity,minimum_quantity,average_unit_cost"
            ),
    ]);

    if (resourcesResult.error) {
        console.error(
            "getResourceStats resources error:",
            resourcesResult.error
        );

        throw normalizeError(resourcesResult.error);
    }

    if (stockResult.error) {
        console.error(
            "getResourceStats stock error:",
            stockResult.error
        );

        throw normalizeError(stockResult.error);
    }

    const resources = resourcesResult.data ?? [];
    const stock = stockResult.data ?? [];

    const totalStockValue = stock.reduce(
        (total, item) =>
            total +
            Number(item.current_quantity ?? 0) *
            Number(item.average_unit_cost ?? 0),
        0
    );

    const lowStockCount = stock.filter(
        (item) =>
            Number(item.current_quantity ?? 0) <=
            Number(item.minimum_quantity ?? 0)
    ).length;

    return {
        totalResources: resources.length,
        totalMaterials: resources.filter(
            (resource) => resource.resource_type === "material"
        ).length,
        totalEquipment: resources.filter(
            (resource) => resource.resource_type === "equipment"
        ).length,
        totalTools: resources.filter(
            (resource) => resource.resource_type === "tool"
        ).length,
        totalPpe: resources.filter(
            (resource) => resource.resource_type === "ppe"
        ).length,
        totalVehicles: resources.filter(
            (resource) => resource.resource_type === "vehicle"
        ).length,

        totalStockValue,

        available: resources.filter(
            (resource) =>
                resource.operational_status === "available"
        ).length,

        inUse: resources.filter(
            (resource) =>
                resource.operational_status === "in_use"
        ).length,

        inMaintenance: resources.filter(
            (resource) =>
                resource.condition_status === "maintenance"
        ).length,

        missing: resources.filter(
            (resource) =>
                resource.operational_status === "missing"
        ).length,

        overdue: resources.filter(
            (resource) =>
                resource.operational_status === "overdue"
        ).length,

        lowStockCount,
    };
}