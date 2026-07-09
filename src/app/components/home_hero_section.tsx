"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomeHeroSection() {

    return (
        <section className="relative xs:hidden min-h-screen flex flex-col items-center space-y-4 justify-center w-full overflow-hidden">
            <div className="absolute inset-0 bg-[url(../../public/images/arch2.jpg)] bg-cover bg-center bg-no-repeat filter brightness-[0.7] min-h-screen"></div>
             <h1 className="text-6xl font-bold z-20">Transformando visões em espaços extraordinários </h1>
            <p className="text-2xl text-gray-300 z-20">Arquitectura, construção e gestão de projectos com excelência e precisão.</p>
        </section>
    )
}