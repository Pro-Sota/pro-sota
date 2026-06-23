
export default function CustomNavbar() {   
    return (<nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
            <div className="flex justify-between items-center">
                <div className="text-xl font-bold">Pro Sota</div>
                <div className="space-x-4">
                    <a href="/" className="hover:text-gray-300">Home</a>
                    <a href="/about" className="hover:text-gray-300">About</a>
                    <a href="/contact" className="hover:text-gray-300">Contact</a>
                </div>
            </div>
        </div>
    </nav>)
}

