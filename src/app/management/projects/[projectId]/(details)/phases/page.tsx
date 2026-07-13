export default function PhasesPage() {

    const phases = [
        {
            name: "Concept Design",
            status: "Completed",
            progress: 100,
            dates: "Jan 10 - Feb 20",
        },
        {
            name: "Schematic Design",
            status: "Completed",
            progress: 100,
            dates: "Feb 21 - Apr 15",
        },
        {
            name: "Technical Design",
            status: "Current",
            progress: 65,
            dates: "Apr 16 - Jun 30",
        },
        {
            name: "Tender",
            status: "Upcoming",
            progress: 0,
            dates: "Jul 01 - Aug 15",
        },
        {
            name: "Construction",
            status: "Upcoming",
            progress: 0,
            dates: "Aug 20 - Dec 30",
        }
    ]


    const deliverables = [
        {
            name: "Construction drawings",
            status: "Completed"
        },
        {
            name: "Structural coordination",
            status: "In Review"
        },
        {
            name: "MEP coordination",
            status: "Pending"
        }
    ]


    const milestones = [
        {
            name: "Client Concept Approval",
            status: "Completed"
        },
        {
            name: "Design Development Complete",
            status: "Completed"
        },
        {
            name: "Authority Submission",
            status: "Pending"
        },
        {
            name: "Tender Package Complete",
            status: "Upcoming"
        }
    ]


    return (

        <div className="p-6 space-y-8 text-gray-700">


            {/* Header */}

            <div className="flex justify-between items-center">

                <div>
                    <h1 className="text-2xl font-bold">
                        Project Phases
                    </h1>

                    <p className="text-gray-500">
                        Track project stages, deliverables and progress.
                    </p>
                </div>


                <button className="bg-slate-600 text-white px-4 py-2 rounded-lg">
                    + Add Phase
                </button>

            </div>



            {/* Overall Progress */}

            <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between mb-3">

                    <h2 className="font-semibold">
                        Overall Project Progress
                    </h2>

                    <span className="font-bold">
                        68%
                    </span>

                </div>


                <div className="h-3 bg-gray-200 rounded-full">

                    <div
                        className="h-3 bg-slate-600 rounded-full"
                        style={{
                            width:"68%"
                        }}
                    />

                </div>


                <div className="mt-4 text-sm text-gray-600">

                    Current Phase:

                    <span className="ml-2 font-medium text-gray-900">
                        Technical Design
                    </span>

                </div>

            </div>




            {/* Timeline */}

            <div className="bg-white rounded-xl shadow p-8">


                <h2 className="font-semibold mb-8">
                    Project Roadmap
                </h2>



                <div className="flex items-start justify-between">


                    {phases.map((phase,index)=>(

                        <div
                            key={phase.name}
                            className="flex-1 text-center relative"
                        >


                            {/* Line */}

                            {index !== phases.length -1 && (

                                <div className="
                                    absolute
                                    top-5
                                    left-1/2
                                    w-full
                                    h-1
                                    bg-gray-200
                                "/>

                            )}



                            {/* Circle */}

                            <div
                                className={`
                                    relative
                                    mx-auto
                                    w-10
                                    h-10
                                    rounded-full
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    font-bold
                                    z-10

                                    ${
                                        phase.status === "Completed"
                                        ? "bg-green-600"
                                        :
                                        phase.status === "Current"
                                        ? "bg-slate-600"
                                        :
                                        "bg-gray-300"
                                    }
                                `}
                            >

                                {index + 1}

                            </div>



                            <h3 className="mt-4 text-sm font-semibold">
                                {phase.name}
                            </h3>


                            <p className="text-xs text-gray-500 mt-1">
                                {phase.dates}
                            </p>


                        </div>

                    ))}
                </div>
            </div>

            {/* Current Phase Details */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between">
                    <div>
                        <h2 className="text-xl font-bold">
                            Technical Design
                        </h2>
                        <p className="text-gray-500">
                            Apr 16 - Jun 30
                        </p>
                    </div>


                    <span className="
                        bg-yellow-100
                        text-yellow-700
                        px-3
                        py-1
                        rounded-full
                        h-fit
                    ">
                        In Progress
                    </span>


                </div>




                {/* Progress */}

                <div className="mt-6">

                    <div className="flex justify-between text-sm mb-2">

                        <span>
                            Phase Completion
                        </span>

                        <span>
                            65%
                        </span>

                    </div>


                    <div className="h-2 bg-gray-200 rounded-full">

                        <div
                            className="h-2 bg-slate-600 rounded-full"
                            style={{
                                width:"65%"
                            }}
                        />

                    </div>

                </div>





                {/* Metrics */}

                <div className="
                    grid
                    grid-cols-4
                    gap-4
                    mt-8
                ">


                    <Metric title="Documents" value="86"/>

                    <Metric title="Tasks" value="24"/>

                    <Metric title="Reviews" value="8"/>

                    <Metric title="Team" value="12"/>


                </div>





                {/* Deliverables */}

                <div className="mt-8">


                    <h3 className="font-semibold mb-4">
                        Deliverables
                    </h3>


                    <div className="space-y-3">

                        {deliverables.map(item=>(

                            <div
                                key={item.name}
                                className="
                                    flex
                                    justify-between
                                    border-b
                                    pb-3
                                "
                            >

                                <span>
                                    {item.name}
                                </span>


                                <span className="text-sm text-gray-500">
                                    {item.status}
                                </span>


                            </div>

                        ))}


                    </div>


                </div>



            </div>





            {/* Milestones */}


            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="font-semibold mb-5">
                    Milestones
                </h2>


                <div className="space-y-4">


                    {milestones.map(item=>(

                        <div
                            key={item.name}
                            className="
                                flex
                                justify-between
                                border-b
                                pb-3
                            "
                        >

                            <span>
                                {item.name}
                            </span>


                            <span className="text-sm text-gray-500">
                                {item.status}
                            </span>


                        </div>

                    ))}


                </div>


            </div>


        </div>

    )
}




function Metric({
    title,
    value
}:{
    title:string,
    value:string
}){

    return (

        <div className="
            bg-gray-50
            rounded-lg
            p-4
        ">

            <p className="text-sm text-gray-500">
                {title}
            </p>


            <p className="text-2xl font-bold">
                {value}
            </p>

        </div>

    )

}