import CustomNavbar from "@/app/components/custom_navbar";
import HomeHeroSection from "@/app/components/home_hero_section";
import { getPublishedPortfolioProjects } from "@/services/portfolio";
import HomePage from "@/app/(client_pages)/home_page";

import { redirect } from "next/navigation";

export const revalidate = 300;

export default async function Home() {

  const projects = await getPublishedPortfolioProjects();

  /*   return (
      <div className="bg-white flex flex-col items-center min-h-screen overflow-x-hidden">
       {/*  <CustomNavbar />
        <HomeHeroSection /> *
  
        
  
      </div>
    ); */

    <HomePage portifolios={[]} />
}
