"use client";
import { Grid2X2Icon, ListIcon, MapIcon, SearchIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";



export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [isActive, setIsActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleActive = () => {
    setIsActive(!isActive);
  }

  const buttonClass =
    "h-10 px-4 bg-gray-200 text-gray-700 rounded hover:border-gray-500 border border-transparent transition-colors duration-300 cursor-pointer";

  return (
    <div className="flex flex-col min-h-screen py-2 text-black mx-8">
      <div>
        <h1 className="text-xl text-black">Projectos</h1>
        <hr className="border-gray-300 my-4 mb-8" />

        <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex flex-row items-center gap-3">
          {isOpen ? (
            <div className="relative ">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar projectos..."
                className="h-10 w-72 bg-gray-200 text-gray-700 pl-10 pr-10 border border-gray-300 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => {
                  if (!searchTerm.trim()) {
                    setIsOpen(false);
                  }
                }}
              />

              <button
                onClick={() => {
                  setSearchTerm("");
                  setIsOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="h-10 w-10 bg-gray-200 text-gray-700 rounded hover:border-gray-500 border border-transparent flex items-center justify-center cursor-pointer"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          )}

          <button className={buttonClass}>Todos</button>
          <button className={buttonClass}>Em curso</button>
          <button className={buttonClass}>Concluídos</button>
          <button className={buttonClass}>Em observação</button>
        </div>
          <div className="flex flex-row items-center gap-4">
            <button className="cursor-pointer" title="ver em grade" > <Grid2X2Icon /> </button>
            <button className="cursor-pointer" title="ver em lista" > <ListIcon /> </button>
            <button className="cursor-pointer" title="ver em mapa"   > <MapIcon /> </button>
          </div>
        </div> 
    </div>
    </div>
  );
}