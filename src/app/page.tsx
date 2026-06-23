import CustomNavbar from "@/components/custom_navbar";

export default function Home() {
  return (
    <div>
      <CustomNavbar />
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-6xl font-bold">Welcome to Pro Sota!</h1>
      </div>
    </div>
  );
}
