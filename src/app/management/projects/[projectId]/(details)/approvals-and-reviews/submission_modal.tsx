"use client";

import { useMemo, useState } from "react";
import {
    Check,
    FileText,
    Search,
    X,
} from "lucide-react";

import CustomSelect from "@/app/components/custom_select";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Speciality =
    | ""
    | "architecture"
    | "engineering";

type SubmissionType =
    | ""
    | "design"
    | "technical"
    | "client_approval";

export interface SubmissionDocument {
    document_id: string;
    folder_id: string;
    project_id: string;
    name: string;
    file_path: string;
    version?: number | null;
    uploaded_by?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface Props {
    projectId: string;

    documents: SubmissionDocument[];

    onClose: (isShow: boolean) => void;

    editingId: string;

    onSubmit?: (data: {
        project_id: string;
        title: string;
        description: string | null;
        speciality: Exclude<
            Speciality,
            ""
        >;
        type: Exclude<
            SubmissionType,
            ""
        >;
        document_ids: string[];
    }) => Promise<void>;
}

interface SubmissionFormData {
    title: string;
    description: string;
    type: SubmissionType;
}

interface FormErrors {
    title?: string;
    speciality?: string;
    type?: string;
    documents?: string;
    general?: string;
}

const initialFormData: SubmissionFormData = {
    title: "",
    description: "",
    type: "",
};

const TYPE_LABELS: Record<
    Exclude<SubmissionType, "">,
    string
> = {
    design: "Projecto / Design",
    technical: "Documentação técnica",
    client_approval: "Aprovação do cliente",
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function SubmissionModal({
    projectId,
    documents,
    onClose,
    editingId,
    onSubmit,
}: Props) {
    const [formData, setFormData] =
        useState<SubmissionFormData>(
            initialFormData,
        );

    const [speciality, setSpeciality] =
        useState<Speciality>("");

    const [
        selectedDocumentIds,
        setSelectedDocumentIds,
    ] = useState<string[]>([]);

    const [documentSearch, setDocumentSearch] =
        useState("");

    const [errors, setErrors] =
        useState<FormErrors>({});

    const [isSaving, setIsSaving] =
        useState(false);

    /* ---------------------------------------------------------------------- */
    /* Filter documents                                                       */
    /* ---------------------------------------------------------------------- */

    const filteredDocuments = useMemo(() => {
        const query =
            documentSearch
                .trim()
                .toLowerCase();

        if (!query) {
            return documents;
        }

        return documents.filter(
            (document) =>
                document.name
                    .toLowerCase()
                    .includes(query),
        );
    }, [
        documents,
        documentSearch,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Selected documents                                                     */
    /* ---------------------------------------------------------------------- */

    const selectedDocuments = useMemo(
        () =>
            documents.filter((document) =>
                selectedDocumentIds.includes(
                    document.document_id,
                ),
            ),
        [
            documents,
            selectedDocumentIds,
        ],
    );

    /* ---------------------------------------------------------------------- */
    /* Handlers                                                                */
    /* ---------------------------------------------------------------------- */

    const handleSpecialityChange = (
        value: Speciality,
    ) => {
        setSpeciality(value);

        setFormData((prev) => ({
            ...prev,
            type: "",
        }));

        setErrors((prev) => ({
            ...prev,
            speciality: undefined,
            type: undefined,
            general: undefined,
        }));
    };

    const handleTypeChange = (
        value: SubmissionType,
    ) => {
        setFormData((prev) => ({
            ...prev,
            type: value,
        }));

        setErrors((prev) => ({
            ...prev,
            type: undefined,
            general: undefined,
        }));
    };

    const handleTitleChange = (
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
        }));

        if (value.trim()) {
            setErrors((prev) => ({
                ...prev,
                title: undefined,
                general: undefined,
            }));
        }
    };

    const toggleDocument = (
        documentId: string,
    ) => {
        setSelectedDocumentIds((prev) => {
            if (prev.includes(documentId)) {
                return prev.filter(
                    (id) => id !== documentId,
                );
            }

            return [
                ...prev,
                documentId,
            ];
        });

        setErrors((prev) => ({
            ...prev,
            documents: undefined,
            general: undefined,
        }));
    };

    const removeDocument = (
        documentId: string,
    ) => {
        setSelectedDocumentIds((prev) =>
            prev.filter(
                (id) => id !== documentId,
            ),
        );
    };

    /* ---------------------------------------------------------------------- */
    /* Save                                                                    */
    /* ---------------------------------------------------------------------- */

    const handleSaveSubmission =
        async () => {
            const newErrors: FormErrors = {};

            if (!formData.title.trim()) {
                newErrors.title =
                    "O título da submissão é obrigatório.";
            }

            if (!speciality) {
                newErrors.speciality =
                    "Escolha uma especialidade.";
            }

            if (!formData.type) {
                newErrors.type =
                    "Escolha o tipo de submissão.";
            }

            if (
                selectedDocumentIds.length ===
                0
            ) {
                newErrors.documents =
                    "Seleccione pelo menos um documento.";
            }

            if (
                Object.keys(newErrors).length >
                0
            ) {
                newErrors.general =
                    "Preencha todos os campos obrigatórios.";

                setErrors(newErrors);

                return;
            }

            setErrors({});
            setIsSaving(true);

            try {
                const submissionData = {
                    project_id: projectId,
                    title: formData.title.trim(),
                    description:
                        formData.description.trim() ||
                        null,
                    speciality:
                        speciality as Exclude<
                            Speciality,
                            ""
                        >,
                    type: formData.type as Exclude<
                        SubmissionType,
                        ""
                    >,
                    document_ids:
                        selectedDocumentIds,
                };

                if (onSubmit) {
                    await onSubmit(
                        submissionData,
                    );
                }

                onClose(false);
            } catch (error) {
                console.error(
                    "Failed to save submission:",
                    error,
                );

                setErrors({
                    general:
                        "Não foi possível guardar a submissão.",
                });
            } finally {
                setIsSaving(false);
            }
        };

    /* ---------------------------------------------------------------------- */
    /* Render                                                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => {
                if (!isSaving) {
                    onClose(false);
                }
            }}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {editingId
                                ? "Nova versão da submissão"
                                : "Nova submissão"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Seleccione documentos que já
                            existem neste projeto.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            onClose(false)
                        }
                        disabled={isSaving}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-6">
                    <div className="space-y-5">
                        {/* TITLE */}

                        <div>
                            <label
                                htmlFor="submission-title"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Título *
                            </label>

                            <input
                                id="submission-title"
                                type="text"
                                value={
                                    formData.title
                                }
                                onChange={(event) =>
                                    handleTitleChange(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="ex: Plano Elétrico - Revisão 02"
                                className={`w-full rounded-lg border px-3 py-2.5 outline-none transition focus:ring-2 ${
                                    errors.title
                                        ? "border-red-500 focus:ring-red-100"
                                        : "border-gray-200 focus:border-slate-400 focus:ring-slate-100"
                                }`}
                            />

                            {errors.title && (
                                <p className="mt-1 text-xs text-red-600">
                                    {
                                        errors.title
                                    }
                                </p>
                            )}
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                            <label
                                htmlFor="submission-description"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Descrição
                            </label>

                            <textarea
                                id="submission-description"
                                value={
                                    formData.description
                                }
                                onChange={(event) =>
                                    setFormData(
                                        (prev) => ({
                                            ...prev,
                                            description:
                                                event
                                                    .target
                                                    .value,
                                        }),
                                    )
                                }
                                placeholder="Indique o que pretende que seja revisto..."
                                rows={3}
                                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            />
                        </div>

                        {/* SPECIALITY */}

                        <div>
                            <label
                                htmlFor="submission-speciality"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Especialidade *
                            </label>

                            <CustomSelect
                                id="submission-speciality"
                                value={speciality}
                                onChange={(event) =>
                                    handleSpecialityChange(
                                        event.target
                                            .value as Speciality,
                                    )
                                }
                                className={`w-full rounded-lg border px-3 py-2.5 outline-none transition focus:ring-2 ${
                                    errors.speciality
                                        ? "border-red-500 focus:ring-red-100"
                                        : "border-gray-200 focus:border-slate-400 focus:ring-slate-100"
                                }`}
                            >
                                <option value="">
                                    Escolha a especialidade
                                </option>

                                <option value="architecture">
                                    Especialidade I -
                                    Arquitectura
                                </option>

                                <option value="engineering">
                                    Especialidade II -
                                    Engenharia
                                </option>
                            </CustomSelect>

                            {errors.speciality && (
                                <p className="mt-1 text-xs text-red-600">
                                    {
                                        errors.speciality
                                    }
                                </p>
                            )}
                        </div>

                        {/* TYPE */}

                        {speciality && (
                            <div>
                                <label
                                    htmlFor="submission-type"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Tipo de submissão *
                                </label>

                                <select
                                    id="submission-type"
                                    value={
                                        formData.type
                                    }
                                    onChange={(event) =>
                                        handleTypeChange(
                                            event.target
                                                .value as SubmissionType,
                                        )
                                    }
                                    className={`w-full rounded-lg border px-3 py-2.5 outline-none transition focus:ring-2 ${
                                        errors.type
                                            ? "border-red-500 focus:ring-red-100"
                                            : "border-gray-200 focus:border-slate-400 focus:ring-slate-100"
                                    }`}
                                >
                                    <option value="">
                                        Escolha o tipo
                                    </option>

                                    {speciality ===
                                        "architecture" && (
                                        <>
                                            <option value="design">
                                                Projecto /
                                                Design
                                            </option>

                                            <option value="client_approval">
                                                Aprovação do
                                                cliente
                                            </option>
                                        </>
                                    )}

                                    {speciality ===
                                        "engineering" && (
                                        <>
                                            <option value="technical">
                                                Documentação
                                                técnica
                                            </option>

                                            <option value="client_approval">
                                                Aprovação do
                                                cliente
                                            </option>
                                        </>
                                    )}
                                </select>

                                {formData.type && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {
                                            TYPE_LABELS[
                                                formData.type as Exclude<
                                                    SubmissionType,
                                                    ""
                                                >
                                            ]
                                        }
                                    </p>
                                )}

                                {errors.type && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {
                                            errors.type
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* DOCUMENTS */}

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Documentos *
                                    </label>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Seleccione documentos
                                        que já foram carregados
                                        neste projeto.
                                    </p>
                                </div>

                                <span className="text-xs font-medium text-gray-500">
                                    {
                                        selectedDocumentIds.length
                                    }{" "}
                                    selecionado
                                    {selectedDocumentIds.length ===
                                    1
                                        ? ""
                                        : "s"}
                                </span>
                            </div>

                            {/* SEARCH */}

                            <div className="relative mb-3">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={
                                        documentSearch
                                    }
                                    onChange={(event) =>
                                        setDocumentSearch(
                                            event.target
                                                .value,
                                        )
                                    }
                                    placeholder="Procurar documentos..."
                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                />
                            </div>

                            {/* DOCUMENT LIST */}

                            <div
                                className={`max-h-64 overflow-y-auto rounded-lg border ${
                                    errors.documents
                                        ? "border-red-300"
                                        : "border-gray-200"
                                }`}
                            >
                                {documents.length ===
                                0 ? (
                                    <div className="px-5 py-10 text-center">
                                        <FileText
                                            size={32}
                                            className="mx-auto mb-3 text-gray-300"
                                        />

                                        <p className="text-sm font-medium text-gray-700">
                                            Não existem
                                            documentos
                                            disponíveis.
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Carregue primeiro
                                            os documentos na
                                            pasta de documentos
                                            do projeto.
                                        </p>
                                    </div>
                                ) : filteredDocuments.length ===
                                  0 ? (
                                    <div className="px-5 py-8 text-center">
                                        <p className="text-sm text-gray-500">
                                            Nenhum documento
                                            encontrado.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredDocuments.map(
                                            (
                                                document,
                                            ) => {
                                                const selected =
                                                    selectedDocumentIds.includes(
                                                        document.document_id,
                                                    );

                                                return (
                                                    <button
                                                        key={
                                                            document.document_id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            toggleDocument(
                                                                document.document_id,
                                                            )
                                                        }
                                                        disabled={
                                                            isSaving
                                                        }
                                                        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition ${
                                                            selected
                                                                ? "bg-slate-50"
                                                                : "hover:bg-gray-50"
                                                        } disabled:cursor-default disabled:opacity-60`}
                                                    >
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                                selected
                                                                    ? "bg-[#002950] text-white"
                                                                    : "bg-gray-100 text-gray-500"
                                                            }`}
                                                        >
                                                            {selected ? (
                                                                <Check
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            ) : (
                                                                <FileText
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-800">
                                                                {
                                                                    document.name
                                                                }
                                                            </p>

                                                            <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-gray-500">
                                                                {document.version && (
                                                                    <span>
                                                                        Versão{" "}
                                                                        {
                                                                            document.version
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                                                selected
                                                                    ? "border-[#002950] bg-[#002950]"
                                                                    : "border-gray-300 bg-white"
                                                            }`}
                                                        >
                                                            {selected && (
                                                                <Check
                                                                    size={
                                                                        13
                                                                    }
                                                                    className="text-white"
                                                                />
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>

                            {errors.documents && (
                                <p className="mt-1 text-xs text-red-600">
                                    {
                                        errors.documents
                                    }
                                </p>
                            )}

                            {/* SELECTED DOCUMENTS */}

                            {selectedDocuments.length >
                                0 && (
                                <div className="mt-3">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Documentos
                                        seleccionados
                                    </p>

                                    <div className="space-y-2">
                                        {selectedDocuments.map(
                                            (
                                                document,
                                            ) => (
                                                <div
                                                    key={
                                                        document.document_id
                                                    }
                                                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                                                >
                                                    <FileText
                                                        size={
                                                            16
                                                        }
                                                        className="shrink-0 text-gray-500"
                                                    />

                                                    <p className="min-w-0 flex-1 truncate text-sm text-gray-700">
                                                        {
                                                            document.name
                                                        }
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeDocument(
                                                                document.document_id,
                                                            )
                                                        }
                                                        disabled={
                                                            isSaving
                                                        }
                                                        className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                                                        aria-label={`Remover ${document.name}`}
                                                    >
                                                        <X
                                                            size={
                                                                15
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={() =>
                            onClose(false)
                        }
                        disabled={isSaving}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveSubmission}
                        disabled={isSaving}
                        className="rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#001f3d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSaving
                            ? "A guardar..."
                            : editingId
                              ? "Guardar versão"
                              : "Guardar submissão"}
                    </button>
                </div>
            </div>
        </div>
    );
}
