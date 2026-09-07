"use client";

interface props {
    icon: React.ReactNode;
    label: string;
    value: string;
}
export default function InfoCard({ icon, label, value }: props) {

    return (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#BD9955]/50 border border-[#BD9955] hover:border-[#BD9955] transition-colors">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-[#BD9955]/50">
                <div className="text-[#BD9955]">{icon}</div>
            </div>
            <div>
                <p className="text-xs font-medium text-[#00955]">{label}</p>
                <p className="text-sm font-semibold text-[#00955]">{value}</p>
            </div>
        </div>
    );
}