export default function KpiCard({ title, value }: { title: string, value: string }) {

    const hasPercentage = ["progress"].includes(title.toLowerCase())
    return (
        <div className="text-sm bg-white flex flex-col aspect-square w-full h-22 justify-center space-y-2 items-center p-2 shadow-md border border-gray-100 rounded-md text-black text-center">
            <h1 className="font-bold">{title}</h1>
            <p>{value} {hasPercentage && "%"}</p>
        </div>
    );
}