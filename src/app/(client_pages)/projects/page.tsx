import type { Metadata } from "next";

import { getPortfolioProjects } from "@/actions/portfolio";
import PortfolioManager from "./portfolio_manager";
import ProfileClient from "@/app/management/profile/profile_page";
import PortfolioClient from "./client_page";

export const metadata: Metadata = {
  title: "Portefólio | PRO SOTA",
  description: "Gerir os projectos apresentados no portefólio da PRO SOTA.",
};

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  // return <PortfolioManager initialProjects={projects} />;
  return <PortfolioClient projects={projects}  projectId=""/>
}