"use client";

import { useMemo, useState } from "react";
import {
    Check,
    FileText,
    Search,
    X,
    AlertCircle,
    ChevronDown,
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
        speciality: Exclude<Speciality, "">;
        type: Exclude<SubmissionType, "">;
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

const SPECIALITY_LABELS: Record<
    Exclude<Speciality, "">,
    string
> = {
    architecture: "Especialidade I - Arquitectura",
    engineering: "Especialidade II - Engenharia",
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

    const [expandedSections, setExpandedSections] =
        useState<Record<string, boolean>>({
            documents: true,
        });

    /* ---------------------------------------------------------------------- */
    /* Computed values                                                        */
    /* ---------------------------------------------------------------------- */

    const isFormValid = useMemo(() => {
        return (
            formData.title.trim() !== "" &&
            speciality !== "" &&
            formData.type !== "" &&
            selectedDocumentIds.length > 0
        );
    }, [formData.title, speciality, formData.type, selectedDocumentIds]);

    const filteredDocuments = useMemo(() => {
        const query = documentSearch.trim().toLowerCase();
        if (!query) return documents;
        return documents.filter((document) =>
            document.name.toLowerCase().includes(query),
        );
    }, [documents, documentSearch]);

    const selectedDocuments = useMemo(
        () =>
            documents.filter((document) =>
                selectedDocumentIds.includes(
                    document.document_id,
                ),
            ),
        [documents, selectedDocumentIds],
    );

    const getSubmissionTypeOptions = () => {
        if (speciality === "architecture") {
            return ["design", "client_approval"];
        }
        if (speciality === "engineering") {
            return ["technical", "client_approval"];
        }
        return [];
    };

    /* ---------------------------------------------------------------------- */
    /* Handlers                                                               */
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

    const handleTitleChange = (value: string) => {
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

    const toggleDocument = (documentId: string) => {
        setSelectedDocumentIds((prev) => {
            if (prev.includes(documentId)) {
                return prev.filter((id) => id !== documentId);
            }
            return [...prev, documentId];
        });
        setErrors((prev) => ({
            ...prev,
            documents: undefined,
            general: undefined,
        }));
    };

    const removeDocument = (documentId: string) => {
        setSelectedDocumentIds((prev) =>
            prev.filter((id) => id !== documentId),
        );
    };

    const toggleAllDocuments = () => {
        if (selectedDocumentIds.length === filteredDocuments.length) {
            setSelectedDocumentIds([]);
        } else {
            const allIds = filteredDocuments.map(
                (doc) => doc.document_id,
            );
            setSelectedDocumentIds(allIds);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    /* ---------------------------------------------------------------------- */
    /* Save                                                                    */
    /* ---------------------------------------------------------------------- */

    const handleSaveSubmission = async () => {
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

        if (selectedDocumentIds.length === 0) {
            newErrors.documents =
                "Seleccione pelo menos um documento.";
        }

        if (Object.keys(newErrors).length > 0) {
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
                description: formData.description.trim() || null,
                speciality:
                    speciality as Exclude<Speciality, "">,
                type: formData.type as Exclude<
                    SubmissionType,
                    ""
                >,
                document_ids: selectedDocumentIds,
            };

            if (onSubmit) {
                await onSubmit(submissionData);
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
                <div className="border-b border-gray-200 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId
                                    ? "Nova versão da submissão"
                                    : "Nova submissão"}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Preencha os campos marcados com <span className="font-medium text-gray-700">*</span> para criar a submissão
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
                </div>

                {/* GENERAL ERROR */}
                {errors.general && (
                    <div className="border-b border-red-200 bg-red-50 px-6 py-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle
                                size={18}
                                className="text-red-600"
                            />
                            <p className="text-sm font-medium text-red-800">
                                {errors.general}
                            </p>
                        </div>
                    </div>
                )}

                {/* FORM CONTENT */}
                <div className="overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                        {/* TITLE SECTION */}
                        <div>
                            <label
                                htmlFor="submission-title"
                                className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-900"
                            >
                                Título <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="submission-title"
                                type="text"
                                value={formData.title}
                                onChange={(event) =>
                                    handleTitleChange(
                                        event.target.value,
                                    )
                                }
                                placeholder="ex: Plano Elétrico - Revisão 02"
                                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                                    errors.title
                                        ? "border-red-500 focus:ring-red-100"
                                        : "border-gray-300 focus:border-slate-400 focus:ring-slate-100"
                                }`}
                            />
                            {errors.title && (
                                <div className="mt-2 flex items-center gap-2">
                                    <AlertCircle
                                        size={14}
                                        className="text-red-600"
                                    />
                                    <p className="text-xs text-red-600">
                                        {errors.title}
                                    </p>
                                </div>
                            )}
                            {formData.title.trim() && !errors.title && (
                                <p className="mt-2 text-xs text-gray-500">
                                    ✓ Campo preenchido
                                </p>
                            )}
                        </div>

                        {/* DESCRIPTION SECTION */}
                        <div>
                            <label
                                htmlFor="submission-description"
                                className="mb-2 block text-sm font-semibold text-gray-900"
                            >
                                Descrição
                            </label>
                            <p className="mb-2 text-xs text-gray-500">
                                Indique o que pretende que seja revisto ou
                                qualquer detalhe relevante
                            </p>
                            <textarea
                                id="submission-description"
                                value={formData.description}
                                onChange={(event) =>
                                    setFormData(
                                        (prev) => ({
                                            ...prev,
                                            description:
                                                event.target
                                                    .value,
                                        }),
                                    )
                                }
                                placeholder="ex: Revisar dimensões das portas e locação das tomadas..."
                                rows={3}
                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            />
                        </div>

                        {/* SPECIALITY & TYPE SECTION */}
                        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                            <div>
                                <label
                                    htmlFor="submission-speciality"
                                    className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-900"
                                >
                                    Especialidade <span className="text-red-500">*</span>
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
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                                        errors.speciality
                                            ? "border-red-500 focus:ring-red-100"
                                            : "border-gray-300 focus:border-slate-400 focus:ring-slate-100"
                                    }`}
                                >
                                    <option value="">
                                        Escolha a especialidade
                                    </option>
                                    <option value="architecture">
                                        {SPECIALITY_LABELS.architecture}
                                    </option>
                                    <option value="engineering">
                                        {SPECIALITY_LABELS.engineering}
                                    </option>
                                </CustomSelect>
                                {errors.speciality && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <AlertCircle
                                            size={14}
                                            className="text-red-600"
                                        />
                                        <p className="text-xs text-red-600">
                                            {errors.speciality}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* TYPE */}
                            {speciality && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label
                                        htmlFor="submission-type"
                                        className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-900"
                                    >
                                        Tipo de submissão{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <p className="mb-2 text-xs text-gray-600">
                                        {speciality === "architecture"
                                            ? "Escolha entre projeto/design ou aprovação do cliente"
                                            : "Escolha entre documentação técnica ou aprovação do cliente"}
                                    </p>
                                    <CustomSelect
                                        id="submission-type"
                                        value={formData.type}
                                        onChange={(event) =>
                                            handleTypeChange(
                                                event.target
                                                    .value as SubmissionType,
                                            )
                                        }
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                                            errors.type
                                                ? "border-red-500 focus:ring-red-100"
                                                : "border-gray-300 focus:border-slate-400 focus:ring-slate-100"
                                        }`}
                                    >
                                        <option value="">
                                            Escolha o tipo
                                        </option>
                                        {getSubmissionTypeOptions().map(
                                            (type) => (
                                                <option
                                                    key={type}
                                                    value={type}
                                                >
                                                    {
                                                        TYPE_LABELS[
                                                            type as Exclude<
                                                                SubmissionType,
                                                                ""
                                                            >
                                                        ]
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </CustomSelect>
                                    {errors.type && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <AlertCircle
                                                size={14}
                                                className="text-red-600"
                                            />
                                            <p className="text-xs text-red-600">
                                                {errors.type}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* DOCUMENTS SECTION */}
                        <div className="border border-gray-200 rounded-lg">
                            {/* Section Header */}
                            <button
                                type="button"
                                onClick={() =>
                                    toggleSection("documents")
                                }
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText
                                        size={18}
                                        className="text-gray-600"
                                    />
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">
                                                Documentos
                                            </h3>
                                            <span className="text-red-500">
                                                *
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5">
                                                <span className="h-2 w-2 rounded-full bg-[#002950]"></span>
                                                <span className="text-xs font-medium text-gray-700">
                                                    {
                                                        selectedDocumentIds.length
                                                    }{" "}
                                                    selecionado
                                                    {selectedDocumentIds.length ===
                                                    1
                                                        ? ""
                                                        : "s"}
                                                </span>
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Seleccione documentos já
                                            carregados
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={`text-gray-400 transition-transform ${
                                        expandedSections.documents
                                            ? ""
                                            : "-rotate-90"
                                    }`}
                                />
                            </button>

                            {expandedSections.documents && (
                                <>
                                    <div className="border-t border-gray-200 px-4 py-3">
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
                                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                            />
                                        </div>

                                        {/* DOCUMENT LIST */}
                                        {documents.length === 0 ? (
                                            <div className="rounded-lg bg-gray-50 px-5 py-10 text-center">
                                                <FileText
                                                    size={32}
                                                    className="mx-auto mb-3 text-gray-300"
                                                />
                                                <p className="text-sm font-medium text-gray-700">
                                                    Não existem documentos
                                                    disponíveis.
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Carregue os documentos
                                                    na pasta de documentos
                                                    do projeto primeiro.
                                                </p>
                                            </div>
                                        ) : filteredDocuments.length ===
                                          0 ? (
                                            <div className="rounded-lg bg-gray-50 px-5 py-8 text-center">
                                                <p className="text-sm text-gray-500">
                                                    Nenhum documento
                                                    encontrado com "{
                                                        documentSearch
                                                    }"
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* SELECT ALL */}
                                                <div className="mb-3 flex items-center gap-2 pb-3 border-b border-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        id="select-all-docs"
                                                        checked={
                                                            selectedDocumentIds.length ===
                                                                filteredDocuments.length &&
                                                            filteredDocuments.length >
                                                                0
                                                        }
                                                        onChange={
                                                            toggleAllDocuments
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300 text-[#002950] focus:ring-offset-0"
                                                    />
                                                    <label
                                                        htmlFor="select-all-docs"
                                                        className="text-sm font-medium text-gray-700 cursor-pointer"
                                                    >
                                                        Seleccionar tudo
                                                    </label>
                                                </div>

                                                {/* DOCUMENT LIST */}
                                                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
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
                                                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                                                                        selected
                                                                            ? "bg-slate-50"
                                                                            : "hover:bg-gray-50"
                                                                    } disabled:cursor-default disabled:opacity-60`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            selected
                                                                        }
                                                                        onChange={() => {}}
                                                                        className="h-4 w-4 rounded border-gray-300 text-[#002950] focus:ring-offset-0"
                                                                        aria-label={
                                                                            document.name
                                                                        }
                                                                    />

                                                                    <FileText
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="shrink-0 text-gray-500"
                                                                    />

                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-gray-800">
                                                                            {
                                                                                document.name
                                                                            }
                                                                        </p>

                                                                        {document.version && (
                                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                                Versão{" "}
                                                                                {
                                                                                    document.version
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {errors.documents && (
                                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                                                <AlertCircle
                                                    size={14}
                                                    className="text-red-600"
                                                />
                                                <p className="text-xs text-red-600">
                                                    {
                                                        errors.documents
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* SELECTED DOCUMENTS PREVIEW */}
                        {selectedDocuments.length > 0 && (
                            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-900">
                                    {selectedDocuments.length} documento
                                    {selectedDocuments.length === 1
                                        ? ""
                                        : "s"}{" "}
                                    selecionado
                                    {selectedDocuments.length === 1
                                        ? ""
                                        : "s"}
                                </p>
                                <div className="space-y-2">
                                    {selectedDocuments.map(
                                        (document) => (
                                            <div
                                                key={
                                                    document.document_id
                                                }
                                                className="flex items-center gap-3 rounded-lg bg-white border border-blue-100 px-3 py-2"
                                            >
                                                <FileText
                                                    size={16}
                                                    className="shrink-0 text-blue-600"
                                                />
                                                <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                                                    {document.name}
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
                                                    className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                    aria-label={`Remover ${document.name}`}
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={() => onClose(false)}
                        disabled={isSaving}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <div className="flex items-center gap-3">
                        {!isFormValid && (
                            <p className="text-xs text-gray-500">
                                Preencha todos os campos
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={handleSaveSubmission}
                            disabled={isSaving || !isFormValid}
                            className="rounded-lg bg-[#002950] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#001f3d] disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
    );
}