"use client";



export default function Timeline() {
    return (
        <div className="w-full h-[500px] bg-gray-100 rounded-md shadow-md p-4">
            <div className="w-full h-full bg-gray-200 flex flex-row items-center">
                <div className="w-1/5 h-full flex flex-col bg-white">
                </div>
                <div className="flex flex-1 h-full flex-col">
                    <div><h2>Month</h2></div>
                    <div className="grid grid-cols-12 gap-1 h-full">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}