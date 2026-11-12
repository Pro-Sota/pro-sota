export const initialValues = {
  full_name: "",
  contact_phone: "",
  contact_email: "",
  decision_makers: "",
  preferred_contact: "",

  budget: "",
  budget_undisclosed: "",

  location_address: "",
  location_neighborhood: "",
  location_municipality: "",
  location_reference: "",
  location_city: "",
  location_province: "",
  latitude: "",
  longitude: "",

  land_ownership: "",
  land_area: "",
  land_length: "",
  land_width: "",
  land_type: "",
  existing_buildings: "",
  has_trees: "",
  infrastructure: [] as string[],

  residents_count: "",
  domestic_workers: "",
  domestic_workers_count: "",
  resident_profiles: "",
  family_growth: "",
  works_from_home: "",
  visitors_frequency: "",
  pets: "",
  current_home_dislikes: "",
  current_home_likes: "",

  bedrooms_count: "",
  suites_count: "",
  desired_spaces: [] as string[],
  desired_spaces_other: "",
  cars_count: "",
  kitchen_layout: "",
  floor_count: "",
  floor_count_other: "",
  essential_space: "",

  service_scope: "",
  project_priorities: [] as string[],
  construction_start: "",

  architectural_style: [] as string[],
  architectural_style_other: "",
  colour_material_preferences: "",
  natural_light_rating: "",
  privacy_rating: "",
  reference_links: "",
  other_information: "",
};

export type BriefValues = typeof initialValues;
export type StringKey = {
  [K in keyof BriefValues]: BriefValues[K] extends string ? K : never;
}[keyof BriefValues];
export type ArrayKey = Exclude<keyof BriefValues, StringKey>;

export type Update = <K extends keyof BriefValues>(
  name: K,
  value: BriefValues[K]
) => void;

export function createInitialValues(): BriefValues {
  return {
    ...initialValues,
    infrastructure: [],
    desired_spaces: [],
    project_priorities: [],
    architectural_style: [],
  };
}