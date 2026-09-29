import { notFound } from "next/navigation";

import { getClient } from "@/services/clients";

import ClientView from "./client_view";

interface Props {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientPage({
  params,
}: Props) {
  const { clientId } = await params;

  const client = await getClient(clientId);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <ClientView client={client} />
      </div>
    </div>
  );
}