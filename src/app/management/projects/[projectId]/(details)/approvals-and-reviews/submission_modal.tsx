"use client";

import { useState } from "react";
import { X, FileText, Upload } from "lucide-react";

interface Props {
    projectId: string;
    onClose: (isShow: boolean) => void;
    editingId: string;
}

type Speciality = "" | "architecture" | "engineering";

type SubmissionType =
    | ""
    | "design"
    | "technical"
    | "client_approval";

interface SubmissionFormData {
    title: string;
    description: string;
    type: SubmissionType;
}

interface FormErrors {
    title?: string;
    speciality?: string;
    type?: string;
    file?: string;
    general?: string;
}

const initialFormData: SubmissionFormData = {
    title: "",
    description: "",
    type: "",
};

export default function SubmissionModal({
    projectId,
    onClose,
    editingId,
}: Props) {
    const [formData, setFormData] =
        useState<SubmissionFormData>(initialFormData);

    const [speciality, setSpeciality] =
        useState<Speciality>("");

    const [file, setFile] =
        useState<File | null>(null);

    const [errors, setErrors] =
        useState<FormErrors>({});

    const [isSaving, setIsSaving] =
        useState(false);

    const handleSpecialityChange = (
        value: Speciality
    ) => {
        setSpeciality(value);

        // Changing the speciality resets the submission type
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
        value: SubmissionType
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
        value: string
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

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile =
            event.target.files?.[0] ?? null;

        setFile(selectedFile);

        if (selectedFile) {
            setErrors((prev) => ({
                ...prev,
                file: undefined,
                general: undefined,
            }));
        }

        // Allows selecting the same file again later
        event.target.value = "";
    };

    const handleRemoveFile = () => {
        setFile(null);

        setErrors((prev) => ({
            ...prev,
            file: undefined,
            general: undefined,
        }));
    };

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

        if (!file) {
            newErrors.file =
                "Adicione um ficheiro.";
        }

        const hasFieldErrors =
            Object.keys(newErrors).length > 0;

        if (hasFieldErrors) {
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
                    formData.description.trim() || null,
                speciality,
                type: formData.type,
            };

            console.log("Creating submission:", {
                submissionData,
                file,
                editingId,
            });

            /*
             * TODO:
             *
             * await createSubmissionWithFile(
             *     submissionData,
             *     file
             * );
             */

            onClose(false);
        } catch (error) {
            console.error(
                "Failed to save submission:",
                error
            );

            setErrors({
                general:
                    "Não foi possível guardar a submissão.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
            onClick={() => onClose(false)
            }
        >
            <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {editingId
                        ? "Editar Submissão"
                        : "Nova Submissão"}
                </h2>

                <div className="space-y-4">

                    {/* TITLE */}
                    <div>
                        <label
                            htmlFor="submission-title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Título *
                        </label>

                        <input
                            id="submission-title"
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                handleTitleChange(
                                    e.target.value
                                )
                            }
                            placeholder="ex: Plano Elétrico - Revisão 02"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-slate-500"
                                }`}
                        />

                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label
                            htmlFor="submission-description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Descrição
                        </label>

                        <textarea
                            id="submission-description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description:
                                        e.target.value,
                                }))
                            }
                            placeholder="Detalhes adicionais..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                        />
                    </div>

                    {/* SPECIALITY */}
                    <div>
                        <label
                            htmlFor="submission-speciality"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Especialidade *
                        </label>

                        <select
                            id="submission-speciality"
                            value={speciality}
                            onChange={(e) =>
                                handleSpecialityChange(
                                    e.target.value as Speciality
                                )
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.speciality
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:ring-slate-500"
                                }`}
                        >
                            <option value="">
                                Escolha a especialidade
                            </option>

                            <option value="architecture">
                                Especialidade I - Arquitectura
                            </option>

                            <option value="engineering">
                                Especialidade II - Engenharia
                            </option>
                        </select>

                        {errors.speciality && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.speciality}
                            </p>
                        )}
                    </div>

                    {/* TYPE */}
                    {speciality !== "" && (
                        <div>
                            <label
                                htmlFor="submission-type"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Tipo de submissão *
                            </label>

                            <select
                                id="submission-type"
                                value={formData.type}
                                onChange={(e) =>
                                    handleTypeChange(
                                        e.target.value as SubmissionType
                                    )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-slate-500"
                                    }`}
                            >
                                <option value="">
                                    Escolha o tipo
                                </option>

                                {speciality ===
                                    "architecture" && (
                                        <>
                                            <option value="design">
                                                Projecto / Design
                                            </option>

                                            <option value="client_approval">
                                                Aprovação do cliente
                                            </option>
                                        </>
                                    )}

                                {speciality ===
                                    "engineering" && (
                                        <>
                                            <option value="technical">
                                                Documentação técnica
                                            </option>

                                            <option value="client_approval">
                                                Aprovação do cliente
                                            </option>
                                        </>
                                    )}
                            </select>

                            {errors.type && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.type}
                                </p>
                            )}
                        </div>
                    )}

                    {/* FILE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ficheiro *
                        </label>

                        {!file ? (
                            <label
                                htmlFor="submission-file"
                                className={`flex flex-col items-center justify-center w-full min-h-28 border-2 border-dashed rounded-lg cursor-pointer transition ${errors.file
                                    ? "border-red-500 bg-red-50/30 hover:border-red-600"
                                    : "border-gray-200 hover:border-slate-400 hover:bg-gray-50"
                                    }`}
                            >
                                <Upload
                                    size={22}
                                    className={`mb-2 ${errors.file
                                        ? "text-red-500"
                                        : "text-gray-500"
                                        }`}
                                />

                                <span className="text-sm font-medium text-gray-700">
                                    Adicionar ficheiro
                                </span>

                                <span className="text-xs text-gray-500 mt-1">
                                    Seleccione um único ficheiro
                                </span>

                                <input
                                    id="submission-file"
                                    type="file"
                                    onChange={
                                        handleFileChange
                                    }
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText
                                        size={20}
                                        className="text-gray-500 shrink-0"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {file.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {(
                                                file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleRemoveFile
                                    }
                                    disabled={isSaving}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-md transition shrink-0 disabled:opacity-50"
                                    aria-label={`Remover ${file.name}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {errors.file && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.file}
                            </p>
                        )}
                    </div>
                </div>

                {/* GENERAL ERROR */}
                {errors.general && (
                    <div className="mt-5 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                            {errors.general}
                        </p>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-3 mt-4 pt-5 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => onClose(false)
                        }
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleSaveSubmission
                        }
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 text-white bg-slate-800 hover:bg-slate-900 rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {isSaving
                            ? "A guardar..."
                            : editingId
                                ? "Guardar"
                                : "Criar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

