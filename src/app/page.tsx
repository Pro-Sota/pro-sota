import CustomNavbar from "@/app/components/custom_navbar";
import HomeHeroSection from "@/app/components/home_hero_section";

import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  /*   return (
      <div className="bg-white flex flex-col items-center min-h-screen overflow-x-hidden">
       {/*  <CustomNavbar />
        <HomeHeroSection /> *
  
        
  
      </div>
    ); */

    router.push("/management")
}
