import Link from "next/link";
import Image from "next/image";

export default function managementMenu() {
    return (
        <nav className="fixed bg-neutral-700 text-white px-4 w-[250px] flex flex-col items-start min-h-screen">
            <div className="flex justify-start items-start mb-4 mt-2 w-full ">
                <Image className="w-full h-auto" loading="eager" src="/images/logo.png" quality={100} alt="Logo" width={100} height={100} priority unoptimized />
            </div>
            <ul className="flex flex-col space-y-2 justify-startitems-start">
                <div className="flex flex-col space-y-2 text-md">
                    <li><Link href="/management" className="hover:text-gray-300">Overview</Link></li>
                    <li><Link href="/management/projects" className="hover:text-gray-300">Projects</Link></li>
                    <li><Link href="/management/communication" className="hover:text-gray-300">Communication</Link></li>
                    <li><Link href="/management/clients" className="hover:text-gray-300">Clients</Link></li>
                    <li><Link href="/management/design-and-drawing" className="hover:text-gray-300">Design and Drawing</Link></li>
                    <li><Link href="/management/team" className="hover:text-gray-300">Team</Link></li>
                    <li><Link href="/management/tasks-and-schedule" className="hover:text-gray-300">Tasks and Schedule</Link></li>
                    <li><Link href="/management/finances" className="hover:text-gray-300">Finance</Link></li>
                    <li><Link href="/management/documents-and-reports" className="hover:text-gray-300">Documents & Reports</Link></li>
                    <li><Link href="/management/construction-administration" className="hover:text-gray-300">Construction Administration</Link></li>
                    <li><Link href="/management/settings" className="hover:text-gray-300">Settings</Link></li>
                </div>
            </ul>
        </nav>
    );
}