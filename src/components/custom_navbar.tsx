"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";





export default function CustomNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    return (<nav className={` ${isMenuOpen ? "bg-transparent" : ""} duration-500 z-50 transition transition ease-in-out
    fixed w-full p-4 lg:px-8`}
    >
        <div className="flex justify-between bg-transparent">
            <div className="text-3xl font-bold text-yellow-600">Pro Sota</div>
            <div className="space-x-4 justify-center items-center hidden md:flex">
                <Link href="/" className="hover:text-gray-300">Home</Link>
                <Link href="/" className="hover:text-gray-300">Projectos</Link>
                <Link href="/" className="hover:text-gray-300">Sobre Nós</Link>
                <Link href="/" className="hover:text-gray-300">Serviços</Link>
                <button onClick={toggleMenu} className="items-center hover:text-gray-300 cursor-pointer ">
                    {isMenuOpen ? <XIcon className="h-10 w-10" /> : <MenuIcon className="h-10 w-10" />}
                </button>
            </div>
        </div>
    </nav>)
}

