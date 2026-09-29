import { getClientOptions } from "@/services/clients";

import NewProjectForm from "./project_form";

export default async function NewProjectPage() {
  const clients = await getClientOptions();

  return (
    <NewProjectForm
      clients={clients}
    />
  );
}