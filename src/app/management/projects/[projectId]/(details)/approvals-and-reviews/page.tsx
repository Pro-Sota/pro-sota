export default function ApprovalsAndReviewsPage() {
    const submissions = [
        {
            id: 1,
            title: "Architectural Drawings - Revision 03",
            submittedBy: "Carlos Mendes",
            date: "10 Jul 2026",
            status: "Under Review",
            type: "Design"
        },
        {
            id: 2,
            title: "Structural Package - Revision 02",
            submittedBy: "Ana Silva",
            date: "08 Jul 2026",
            status: "Changes Requested",
            type: "Technical"
        },
        {
            id: 3,
            title: "Interior Materials Selection",
            submittedBy: "João Costa",
            date: "05 Jul 2026",
            status: "Approved",
            type: "Client Approval"
        }
    ]

    return (
        <div className="p-6 space-y-6 text-gray-700">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">
                        Aprovações e Revisões
                    </h1>
                    <p className="text-gray-500">
                        Manage project submissions, reviews and approvals.
                    </p>
                </div>

                <button className="bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer">
                    + Nova Submissão
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                    <p className="text-gray-500 text-sm">
                        Pending Reviews
                    </p>
                    <h2 className="text-3xl font-bold">
                        12
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-4">
                    <p className="text-gray-500 text-sm">
                        Approved
                    </p>
                    <h2 className="text-3xl font-bold text-green-600">
                        42
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-4">
                    <p className="text-gray-500 text-sm">
                        Changes Requested
                    </p>
                    <h2 className="text-3xl font-bold text-orange-500">
                        5
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-4">
                    <p className="text-gray-500 text-sm">
                        Overdue
                    </p>
                    <h2 className="text-3xl font-bold text-red-600">
                        3
                    </h2>
                </div>
            </div>


            {/* Reviews Table */}
            <div className="bg-white rounded-xl shadow">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">
                        Submissions
                    </h2>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4">
                                Document
                            </th>
                            <th className="text-left p-4">
                                Type
                            </th>
                            <th className="text-left p-4">
                                Submitted By
                            </th>
                            <th className="text-left p-4">
                                Date
                            </th>
                            <th className="text-left p-4">
                                Status
                            </th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {submissions.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t hover:bg-gray-50"
                            >
                                <td className="p-4 font-medium">
                                    {item.title}
                                </td>
                                <td className="p-4">
                                    {item.type}
                                </td>
                                <td className="p-4">
                                    {item.submittedBy}
                                </td>
                                <td className="p-4">
                                    {item.date}
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`
                                            px-3 py-1 rounded-full text-sm
                                            ${item.status === "Approved"
                                                ? "bg-green-100 text-green-700"
                                                :
                                                item.status === "Changes Requested"
                                                    ? "bg-orange-100 text-orange-700"
                                                    :
                                                    "bg-blue-100 text-blue-700"
                                            }
                                        `}
                                    >
                                        {item.status}
                                    </span>

                                </td>
                                <td className="p-4">
                                    <button className="text-blue-600 hover:underline">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}