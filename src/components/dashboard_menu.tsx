import Link from "next/link";

export default function DashboardMenu() {
    return ( 
        <nav className="bg-white text-black p-4 w-[250px] flex flex-col items-start min-h-screen">
            <ul className="flex flex-col space-y-2 justify-startitems-start">
                <div className="text-2xl font-bold mb-4">Pro Sota</div>
               <div className="flex flex-col space-y-2 text-sm">

                 <li><Link href="/" className="hover:text-gray-300">Dashboard</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Projects</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Communication</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Clientes</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Design and Drawing</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Team</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Tasks and Schedule</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Finance</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Documents & Reports</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Construction Administration</Link></li>
                <li><Link href="/" className="hover:text-gray-300">Settings</Link></li>
               </div>
            </ul>
        </nav>

    ); 

}