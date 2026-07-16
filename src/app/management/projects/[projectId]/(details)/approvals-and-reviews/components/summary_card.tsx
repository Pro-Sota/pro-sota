export default function SummaryCard({ label="", value =0, valueClassName = 'text-gray-900', active=false, onClick = () => {}}) {
    return (
        <button
            onClick={onClick}
            className={`text-left bg-white rounded-xl border p-4 transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2
                ${active ? 'border-slate-500 ring-1 ring-slate-500' : 'border-gray-200 hover:border-gray-300'}`}
        >
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${valueClassName}`}>{value}</p>
        </button>
    );
}