"use client";

interface props {
    icon: React.ReactNode;
    label: string;
    value: string;
}
export default function InfoCard({ icon, label, value }: props) {

    return (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                <div className="text-slate-600">{icon}</div>
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
}