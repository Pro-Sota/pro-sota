import { notFound } from "next/navigation";

import { getClient } from "@/services/clients";

import ClientForm from "../../client_form";

interface Props {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function EditClientPage({
  params,
}: Props) {
  const { clientId } = await params;

  const client = await getClient(clientId);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <ClientForm
          mode="edit"
          client={client}
        />
      </div>
    </div>
  );
}