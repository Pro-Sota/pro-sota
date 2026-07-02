"use client";
import { Clock, Star, Folder, File } from "lucide-react";
import { usePathname } from "next/navigation";


export default function ProjectSidebar({projectId}: {projectId: string  }) {

    const menuList = [
        { name: "Todos os documentos", href: "", icon: <File className="w-4 h-4" /> },
        { name: "Recentes", href: "#", icon: <Clock className="w-4 h-4" /> },
        { name: "Favorites", href: "#", icon: <Star className="w-4 h-4" /> },
    ];

    const pathname = usePathname()
    
    return (
        <div className="w-64 px-4 text-gray-800 text-sm ml-4 border-r border-gray-300">
            <ul className="">
                {menuList.map((item, index) => (
                    <li key={index} className="p-2 bg-white hover:bg-gray-200 cursor-pointer">
                        <div className="flex items-center">
                            <span className="mr-2">{item.icon}</span>
                            <span>{item.name}</span>
                        </div>
                    </li>
                ))}
            </ul>
            <hr className="my-4 border-gray-300" />
            <ul>
                <li className="p-2 bg-white hover:bg-gray-200 cursor-pointer"><div className="flex items-center">
                    <Folder className="w-4 h-4 mr-2" /> <span>Folder</span>
                </div></li>
            </ul>
            <hr className="my-4 border-gray-300" />

            <ul className="mt-32">
                <li className="p-2 bg-white hover:bg-gray-200 cursor-pointer"><div className="flex items-center">
                    <Folder className="w-4 h-4 mr-2" /> <span>Archive</span>
                </div></li>
            </ul>
        </div>
    );
}