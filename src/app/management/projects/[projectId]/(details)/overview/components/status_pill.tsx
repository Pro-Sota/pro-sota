export function StatusPill({ status }: { status: string }) {

    function statusColors(status: string) {
        switch (status) {
            case "Completed":
            case "Answered":
            case "Coordinated":
            case "Issued":
                return "bg-green-50 text-green-700 border-green-200";
            case "Open":
            case "For review":
            case "Pending":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Overdue":
            case "Conflict":
                return "bg-red-50 text-red-700 border-red-200";
            case "Superseded":
            default:
                return "bg-slate-50 text-slate-500 border-slate-200";
        }
    }
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border h-fit ${statusColors(status)}`}>
            {status}
        </span>
    );
}