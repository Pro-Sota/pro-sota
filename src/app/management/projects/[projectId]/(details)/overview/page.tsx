import KpiCard from "./components/kpi_card"

export default function Overview() {
    return (
        <div className="">
            <div className="grid grid-cols-6 gap-4 ">
                <KpiCard title={"Progress"} value={"30"} />
                <KpiCard title={"Days remaining"} value={"30"} />
                <KpiCard title={"Budget used"} value={"30"} />
                <KpiCard title={"Open issues"} value={"10"} />
                <KpiCard title={"Completed tasks"} value={"100 / 200"} />
                <KpiCard title={"Pending approvals"} value={"7"} />
            </div>

            <div className="mt-8">
                <ul>
                    <li>
                        Project leader: Pro Sota
                    </li>
                </ul>
            </div>

            <div className="flex flex-row items-center justify-center h-full w-full mt-4">

            </div>
        </div>
    )
}