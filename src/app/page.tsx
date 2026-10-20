
import HomePage from "@/app/(client_pages)/home_page";


import getProjects from "@/app/(client_pages)/services/portfolio";
import { Suspense } from "react";

export const revalidate = 300;

export default async function Home() {

  const projects = await getProjects();
  return (<Suspense
    fallback={
      <main
        className="min-h-screen"
        aria-label="A carregar página"
      />
    }
  >
    <HomePage projects={projects} />
  </Suspense>
  );
}
