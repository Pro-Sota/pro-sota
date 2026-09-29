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
  created_at: string;
};