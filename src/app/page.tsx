import CustomNavbar from "@/app/components/custom_navbar";
import HomeHeroSection from "@/app/components/home_hero_section";

export default function Home() {
  return (
    <div className="bg-white flex flex-col items-center min-h-screen overflow-x-hidden">
      <CustomNavbar />
      <HomeHeroSection />
    </div>
  );
}
