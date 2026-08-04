"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface FormData {
  // General Info
  supplierName: string;
  category: string;
  nif: string;
  status: string;
  
  // Contact
  contactPerson: string;
  position: string;
  email: string;
  phone: string;
  
  // Address
  address: string;
  city: string;
  province: string;
  
  // Commercial
  paymentTerm: string;
  website: string;
  
  // Observations
  notes: string;
}

const SECTIONS = [
  { id: "general", label: "Informação Geral", icon: "📋" },
  { id: "contact", label: "Contacto", icon: "👤" },
  { id: "address", label: "Morada", icon: "📍" },
  { id: "commercial", label: "Comercial", icon: "💼" },
  { id: "notes", label: "Observações", icon: "📝" },
];

export default function NewSupplierPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState("general");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    supplierName: "",
    category: "",
    nif: "",
    status: "Activo",
    contactPerson: "",
    position: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    paymentTerm: "Pronto pagamento",
    website: "",
    notes: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateSection = (sectionId: string): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (sectionId) {
      case "general":
        if (!formData.supplierName.trim()) newErrors.supplierName = "Nome obrigatório";
        if (!formData.category) newErrors.category = "Categoria obrigatória";
        break;
      case "contact":
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Email inválido";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (sectionId: string) => {
    if (validateSection(currentSection)) {
      setCurrentSection(sectionId);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateSection(currentSection)) {
      return;
    }
    
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Supplier data:", formData);
      // You would typically make an API call here
      // await fetch("/api/suppliers", { method: "POST", body: JSON.stringify(formData) })
      router.push("/suppliers"); // Navigate on success
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isSectionComplete = (sectionId: string): boolean => {
    switch (sectionId) {
      case "general":
        return !!formData.supplierName && !!formData.category;
      case "contact":
        return !!(formData.contactPerson || formData.email || formData.phone);
      case "address":
        return !!(formData.address || formData.city);
      case "commercial":
        return true;
      case "notes":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Novo Fornecedor</h1>
          <p className="mt-2 text-slate-600">Preencha os dados do fornecedor para criá-lo no sistema</p>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col gap-6 lg:flex-row items-center justify-center">
        

          {/* Main Form Content */}
          <div className="">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Information Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Informação Geral</h2>
                    <p className="mt-1 text-sm text-slate-600">Dados básicos do fornecedor</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Nome do fornecedor *
                      </label>
                      <input
                        type="text"
                        value={formData.supplierName}
                        onChange={(e) => updateField("supplierName", e.target.value)}
                        placeholder="Digite o nome completo"
                        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                          errors.supplierName
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                            : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                        }`}
                      />
                      {errors.supplierName && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {errors.supplierName}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Categoria *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => updateField("category", e.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                            errors.category
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                          }`}
                        >
                          <option value="">Selecionar categoria...</option>
                          <option value="Materiais de Construção">Materiais de Construção</option>
                          <option value="Equipamentos">Equipamentos</option>
                          <option value="Ferramentas">Ferramentas</option>
                          <option value="Mobiliário">Mobiliário</option>
                          <option value="Serviços">Serviços</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Outro">Outro</option>
                        </select>
                        {errors.category && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {errors.category}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          NIF (Opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.nif}
                          onChange={(e) => updateField("nif", e.target.value)}
                          placeholder="Ex: 1234567890"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Estado
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => updateField("status", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

              {/* Contact Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Informação de Contacto</h2>
                    <p className="mt-1 text-sm text-slate-600">Dados para comunicação com o fornecedor</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Pessoa de contacto
                        </label>
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => updateField("contactPerson", e.target.value)}
                          placeholder="Nome completo"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => updateField("position", e.target.value)}
                          placeholder="Ex: Gerente de Vendas"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="email@exemplo.com"
                          className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                            errors.email
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                          }`}
                        />
                        {errors.email && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+244 912 345 678"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              {/* Address Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Morada</h2>
                    <p className="mt-1 text-sm text-slate-600">Localização do fornecedor</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Rua, avenida ou praça"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          placeholder="Ex: Luanda"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Província
                        </label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) => updateField("province", e.target.value)}
                          placeholder="Ex: Luanda"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              {/* Commercial Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Informação Comercial</h2>
                    <p className="mt-1 text-sm text-slate-600">Termos e condições de negócio</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Prazo de pagamento
                        </label>
                        <select
                          value={formData.paymentTerm}
                          onChange={(e) => updateField("paymentTerm", e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        >
                          <option value="Pronto pagamento">Pronto pagamento</option>
                          <option value="15 dias">15 dias</option>
                          <option value="30 dias">30 dias</option>
                          <option value="60 dias">60 dias</option>
                          <option value="90 dias">90 dias</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-900">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => updateField("website", e.target.value)}
                          placeholder="https://exemplo.com"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              {/* Notes Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Observações</h2>
                    <p className="mt-1 text-sm text-slate-600">Notas adicionais sobre este fornecedor</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Notas
                    </label>
                    <textarea
                      rows={8}
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Adicione qualquer informação relevante sobre o fornecedor..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white py-6 px-0">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                {currentSection !== "notes" && (
                  <button
                    type="button"
                    onClick={() => {
                      const sectionIndex = SECTIONS.findIndex(s => s.id === currentSection);
                      if (sectionIndex < SECTIONS.length - 1) {
                        handleSectionChange(SECTIONS[sectionIndex + 1].id);
                      }
                    }}
                    className="ml-auto rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    Próximo →
                  </button>
                )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="ml-auto rounded-xl bg-slate-900 px-8 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {submitting ? "A guardar..." : "Guardar fornecedor"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}