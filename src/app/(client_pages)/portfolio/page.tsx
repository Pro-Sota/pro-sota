
import getProjects from "../services/portfolio";
import PortfolioClient from "./client_page";

export default async function PortfolioPage() {
  const projects = await getProjects();

  return <PortfolioClient projects={projects} />;
}
