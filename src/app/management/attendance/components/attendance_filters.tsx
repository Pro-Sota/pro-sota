"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import CustomSelect from "@/app/components/custom_select";
import type { GroupMode, StatusFilter } from "../types";

type AttendanceFiltersProps = {
    search: string;
    onSearchChange: (value: string) => void;
    areaFilter: string;
    onAreaChange: (value: string) => void;
    areas: string[];
    statusFilter: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    groupMode: GroupMode;
    onGroupModeChange: (value: GroupMode) => void;
};

export default function AttendanceFilters({
    search,
    onSearchChange,
    areaFilter,
    onAreaChange,
    areas,
    statusFilter,
    onStatusChange,
    groupMode,
    onGroupModeChange,
}: AttendanceFiltersProps) {
    return (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-md">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder="Pesquisar membro, cargo ou área..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                        aria-label="Pesquisar membros"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <CustomSelect
                        value={areaFilter}
                        onChange={(event) =>
                            onAreaChange(event.target.value)
                        }
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                        aria-label="Filtrar por área"
                    >
                        <option value="Todas as áreas">
                            Todas as áreas
                        </option>

                        {areas.map((area) => (
                            <option key={area} value={area}>
                                {area}
                            </option>
                        ))}
                    </CustomSelect>

                    <CustomSelect
                        value={statusFilter}
                        onChange={(event) =>
                            onStatusChange(
                                event.target.value as StatusFilter,
                            )
                        }
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                        aria-label="Filtrar por estado"
                    >
                        <option value="Todos">
                            Todos os estados
                        </option>
                        <option value="Presente">Presente</option>
                        <option value="Atrasado">Atrasado</option>
                        <option value="Ausente">Ausente</option>
                        <option value="Em falta">Em falta</option>
                    </CustomSelect>

                    <CustomSelect
                        value={groupMode}
                        onChange={(event) =>
                            onGroupModeChange(
                                event.target.value as GroupMode,
                            )
                        }
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                        aria-label="Agrupar resultados"
                    >
                        <option value="none">
                            Sem agrupamento
                        </option>
                        <option value="department">
                            Agrupar por departamento
                        </option>
                    </CustomSelect>

                    <div className="hidden h-10 items-center gap-2 px-1 text-xs text-slate-400 sm:flex">
                        <SlidersHorizontal
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                        />
                        Filtros
                    </div>
                </div>
            </div>
        </div>
    );
}