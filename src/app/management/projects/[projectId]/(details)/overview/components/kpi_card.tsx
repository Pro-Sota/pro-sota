export default function KpiCard({ title, value }: { title: string, value: string }) {

    const hasPercentage = ["progress"].includes(title.toLowerCase())
    return (
        <div className="text-sm bg-white flex flex-col aspect-square w-full h-22 justify-center space-y-2 items-center p-2 shadow-md border border-gray-100 rounded-md text-black text-center">
            <h2 className="font-semibold text-xl">{value} {hasPercentage && "%"}</h2>
            <p className="font-medium text-gray-500">{title}</p>
        </div>
    );
}