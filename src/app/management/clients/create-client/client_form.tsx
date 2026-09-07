export const INITIAL_STATE = {
    client_type: "Individual",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Angola",
    notes: "",
    first_name: "",
    last_name: "",
    organization_name: "",
    contact_person: "",
    status: "Prospective",
    building_number: "",
    apartment_number: "",
    neighborhood: "",
    postal_code: "",
    district: "",
    commune: "",
};

export const CLIENT_TYPE_LABELS = {
    Individual: "Individual",
    Company: "Empresa",
};

// Angola's 18 Provinces
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
].sort();

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
        hasError ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
    }`;

export const sectionClass =
    "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-sm";

export const PHONE_MAX_LENGTH = 12;