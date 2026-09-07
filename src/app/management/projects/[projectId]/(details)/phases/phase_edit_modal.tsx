"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Phase } from "./types";

interface PhaseEditModalProps {
  phase: Phase | null;
  open: boolean;
  onClose: () => void;
  onSave: (phase: Phase) => void;
}

type PhaseFormData = Phase & {
  description?: string;
  startDate?:string;
  endDate?:string;
};

export function PhaseEditModal({
  phase,
  open,
  onClose,
  onSave,
}: PhaseEditModalProps) {
  const [formData, setFormData] = useState<PhaseFormData>(
    phase || {
        id:"",
      name: "",
      status: "Upcoming",
      progress: 0,
      description: "",
      startDate: "",
      endDate: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when phase prop changes
  if (phase && phase !== formData) {
    setFormData(phase);
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "O nome da fase é obrigatório";
    }

    if (!formData.startDate) {
      newErrors.startDate = "A data de início é obrigatória";
    }

    if (!formData.endDate) {
      newErrors.endDate = "A data de fim é obrigatória";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "A data de fim deve ser posterior à data de início";
      }
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = "O progresso deve estar entre 0 e 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(formData);
    } catch (error) {
      setErrors({ submit: "Erro ao guardar a fase. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "progress") {
      setFormData((prev) => ({
        ...prev,
        [name]: Math.max(0, Math.min(100, parseInt(value) || 0)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 sm:py-5 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Editar Fase
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="px-6 py-6 sm:py-8 space-y-6">
                {/* General Error Message */}
                {errors.submit && (
                  <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nome da Fase *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                      errors.name
                        ? "border-red-300 focus:ring-red-900"
                        : "border-gray-300 focus:ring-gray-900 focus:border-gray-400"
                    }`}
                    placeholder="ex: Estudo Prévio / Conceito"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:border-gray-400 transition-all"
                    placeholder="Descrição detalhada da fase e seus objetivos..."
                  />
                </div>

                {/* Dates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        errors.startDate
                          ? "border-red-300 focus:ring-red-900"
                          : "border-gray-300 focus:ring-gray-900 focus:border-gray-400"
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ""}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        errors.endDate
                          ? "border-red-300 focus:ring-red-900"
                          : "border-gray-300 focus:ring-gray-900 focus:border-gray-400"
                      }`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Progress */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Estado
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:border-gray-400 transition-all"
                    >
                      <option value="Upcoming">Por iniciar</option>
                      <option value="Current">Em curso</option>
                      <option value="In Review">Em revisão</option>
                      <option value="Completed">Concluída</option>
                      <option value="Pending">Pendente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Progresso
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        name="progress"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={handleChange}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, rgb(17, 24, 39) 0%, rgb(17, 24, 39) ${formData.progress}%, rgb(229, 231, 235) ${formData.progress}%, rgb(229, 231, 235) 100%)`,
                        }}
                      />
                      <div className="w-12 px-3 py-2.5 rounded-lg border border-gray-300 text-right font-mono text-sm text-gray-900 focus-within:ring-2 focus-within:ring-gray-900 focus-within:ring-offset-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={handleChange}
                          name="progress"
                          className="w-full bg-transparent outline-none text-right"
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-4">%</span>
                    </div>
                    {errors.progress && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.progress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 sm:py-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                >
                  {isSubmitting ? "A guardar..." : "Guardar mudanças"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}