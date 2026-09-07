import { Database } from "@/app/lib/supabase/models";

export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

export type FieldChangeEvent = {
    target: { name: string; value: string };
};

// Angola-specific constants
export const ANGOLA_PROVINCES = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire",
];