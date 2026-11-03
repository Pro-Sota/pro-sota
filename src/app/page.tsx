
import HomePage from "@/app/(client_pages)/home_page";
import {getPublishedPortfolioProjects} from "@/services/portfolio";
import { Suspense, type ComponentProps } from "react";

export const revalidate = 300;

export default async function Home() {

  const projects = await getPublishedPortfolioProjects();
  return (<Suspense
    fallback={
      <main
        className="min-h-screen"
        aria-label="A carregar página"
      />
    }
  >
    <HomePage projects={projects as unknown as ComponentProps<typeof HomePage>["projects"]} />
  </Suspense>
  );
}
