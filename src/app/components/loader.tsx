import { Package } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Package size={54} className="animate-spin text-gray-400" />
    </div>
  );
}