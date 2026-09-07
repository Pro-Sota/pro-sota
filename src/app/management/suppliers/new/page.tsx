"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Save,
  X,
  FileUp,
  Info,
  Clock
} from "lucide-react";

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
  paymentMethod: string;
  website: string;
  creditLimit?: string;
  
  // Observations
  notes: string;
  tags: string[];
}

const SECTIONS = [
  { id: "general", label: "Informação Geral", icon: "📋", requiredFields: ["supplierName", "category"] },
  { id: "contact", label: "Contacto", icon: "👤", requiredFields: [] },
  { id: "address", label: "Morada", icon: "📍", requiredFields: [] },
  { id: "commercial", label: "Comercial", icon: "💼", requiredFields: [] },
  { id: "summary", label: "Revisão", icon: "✓", requiredFields: [] },
];

const FIELD_INFO: Record<string, string> = {
  nif: "Número de Identificação Fiscal - essencial para contratação",
  paymentTerm: "Prazo acordado para pagamento de facturas",
  paymentMethod: "Forma de pagamento preferida (transferência, cheque, etc)",
  creditLimit: "Limite de crédito estabelecido com o fornecedor",
  tags: "Etiquetas para fácil categorização e filtro",
};

export default function NewSupplierPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState("general");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
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
    paymentTerm: "30 dias",
    paymentMethod: "Transferência bancária",
    website: "",
    creditLimit: "",
    notes: "",
    tags: [],
  });

  // Auto-save draft to localStorage
  useEffect(() => {
    if (unsavedChanges) {
      const timer = setTimeout(() => {
        localStorage.setItem("supplierFormDraft", JSON.stringify(formData));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, unsavedChanges]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("supplierFormDraft");
    if (saved) {
      setFormData(JSON.parse(saved));
      setUnsavedChanges(false);
    }
  }, []);

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateSection = (sectionId: string): boolean => {
    const newErrors: Record<string, string> = {};
    const section = SECTIONS.find(s => s.id === sectionId);
    
    if (section) {
      section.requiredFields.forEach(field => {
        const value = formData[field as keyof FormData];
        if (!value || (typeof value === "string" && !value.trim())) {
          newErrors[field] = "Campo obrigatório";
        }
      });
    }

    // Additional validation rules
    if (sectionId === "contact" && formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email inválido";
      }
    }

    if (sectionId === "commercial" && formData.creditLimit) {
      if (!/^\d+(\.\d{2})?$/.test(formData.creditLimit)) {
        newErrors.creditLimit = "Formato inválido (ex: 1000.00)";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (sectionId: string) => {
    if (validateSection(currentSection)) {
      setCurrentSection(sectionId);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      setShowConfirmCancel(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = () => {
    localStorage.removeItem("supplierFormDraft");
    router.back();
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        setUploadedDocuments(prev => [...prev, file.name]);
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateSection(currentSection)) {
      return;
    }
    
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log("Supplier data:", formData);
      
      // Clear draft on successful submission
      localStorage.removeItem("supplierFormDraft");
      router.push("/management/suppliers");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);
    return Math.round(((currentIndex + 1) / SECTIONS.length) * 100);
  };

  const isSectionComplete = (sectionId: string): boolean => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return false;
    
    return section.requiredFields.every(field => {
      const value = formData[field as keyof FormData];
      return value && (typeof value === "string" ? value.trim() : true);
    });
  };

  const completedSections = SECTIONS.filter(s => isSectionComplete(s.id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Novo Fornecedor</h1>
            <p className="mt-2 text-slate-600">Preencha os dados para criar um novo fornecedor no sistema</p>
          </div>
          {unsavedChanges && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
              <Clock size={16} />
              A guardar...
            </div>
          )}
        </div>

        <div className="flex gap-6 lg:flex-row flex-col">
          {/* Sidebar - Progress & Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Progress Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Progresso</h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">
                      {completedSections}/{SECTIONS.length - 1} seções
                    </span>
                    <span className="text-xs font-bold text-slate-900">{calculateProgress()}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-slate-900 transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="space-y-2">
                  {SECTIONS.map((section, idx) => {
                    const isComplete = isSectionComplete(section.id);
                    const isActive = currentSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
                          isActive
                            ? "bg-slate-900 text-white"
                            : isComplete
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-base">{section.icon}</span>
                        <span className="flex-1">{section.label}</span>
                        {isComplete && !isActive && <CheckCircle2 size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="rounded-xl border border-slate-200 bg-blue-50 p-4">
                <div className="flex gap-2 text-xs text-blue-900">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Dica</p>
                    <p className="text-blue-800">Preencha os campos obrigatórios para continuar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Information Section */}
              {currentSection === "general" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                  <div className="pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Informação Geral</h2>
                    <p className="mt-1 text-sm text-slate-600">Dados básicos e essenciais do fornecedor</p>
                  </div>

                  <div className="space-y-6">
                    {/* Supplier Name */}
                    <div>
                      <label className="mb-2 flex items-center gap-2">
                        <span className="block text-sm font-semibold text-slate-900">
                          Nome do fornecedor *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.supplierName}
                        onChange={(e) => updateField("supplierName", e.target.value)}
                        placeholder="Digite o nome completo da empresa"
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

                    {/* Category & NIF */}
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
                          <option value="Construção">Construção</option>
                          <option value="Materiais de Construção">Materiais de Construção</option>
                          <option value="Equipamentos">Equipamentos</option>
                          <option value="Ferramentas">Ferramentas</option>
                          <option value="Mobiliário">Mobiliário</option>
                          <option value="Serviços">Serviços</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Limpeza">Limpeza</option>
                          <option value="Segurança">Segurança</option>
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
                        <label className="mb-2 flex items-center gap-2">
                          <span className="block text-sm font-semibold text-slate-900">NIF</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            title={FIELD_INFO.nif}
                          >
                            <Info size={14} />
                          </button>
                        </label>
                        <input
                          type="text"
                          value={formData.nif}
                          onChange={(e) => updateField("nif", e.target.value)}
                          placeholder="Ex: 1234567890"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                        <p className="mt-1 text-xs text-slate-500">{FIELD_INFO.nif}</p>
                      </div>
                    </div>

                    {/* Status & Tags */}
                    <div className="grid gap-6 md:grid-cols-2">
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

                      <div>
                        <label className="mb-2 flex items-center gap-2">
                          <span className="block text-sm font-semibold text-slate-900">Tags</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            title="Adicione etiquetas para filtro rápido"
                          >
                            <Info size={14} />
                          </button>
                        </label>
                        <input
                          type="text"
                          value={formData.tags.join(", ")}
                          onChange={(e) => updateField("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                          placeholder="Ex: Urgente, VIP, Local"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                        <p className="mt-1 text-xs text-slate-500">Separe as tags com vírgulas</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {currentSection === "contact" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                  <div className="pb-6 border-b border-slate-200">
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
              )}

              {/* Address Section */}
              {currentSection === "address" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                  <div className="pb-6 border-b border-slate-200">
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
              )}

              {/* Commercial Section */}
              {currentSection === "commercial" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                  <div className="pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Informação Comercial</h2>
                    <p className="mt-1 text-sm text-slate-600">Termos e condições de negócio</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 flex items-center gap-2">
                          <span className="block text-sm font-semibold text-slate-900">Prazo de pagamento</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            title={FIELD_INFO.paymentTerm}
                          >
                            <Info size={14} />
                          </button>
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
                          <option value="Negociável">Negociável</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2">
                          <span className="block text-sm font-semibold text-slate-900">Método de pagamento</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            title={FIELD_INFO.paymentMethod}
                          >
                            <Info size={14} />
                          </button>
                        </label>
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) => updateField("paymentMethod", e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        >
                          <option value="Transferência bancária">Transferência bancária</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Cartão de crédito">Cartão de crédito</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
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

                      <div>
                        <label className="mb-2 flex items-center gap-2">
                          <span className="block text-sm font-semibold text-slate-900">Limite de crédito</span>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600"
                            title={FIELD_INFO.creditLimit}
                          >
                            <Info size={14} />
                          </button>
                        </label>
                        <input
                          type="text"
                          value={formData.creditLimit}
                          onChange={(e) => updateField("creditLimit", e.target.value)}
                          placeholder="Ex: 5000.00"
                          className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                            errors.creditLimit
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-slate-300 focus:border-slate-900 focus:ring-slate-900/10"
                          }`}
                        />
                        {errors.creditLimit && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {errors.creditLimit}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Observações
                      </label>
                      <textarea
                        rows={5}
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        placeholder="Adicione qualquer informação relevante..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    {/* Document Upload */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Documentos (Opcional)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                        className="w-full rounded-xl border-2 border-dashed border-slate-300 py-6 text-center hover:border-slate-400 hover:bg-slate-50 transition flex flex-col items-center justify-center gap-2"
                      >
                        <FileUp size={24} className="text-slate-400" />
                        <p className="text-sm font-medium text-slate-700">Carregar documentos</p>
                        <p className="text-xs text-slate-500">Propostas, contratos, certificados, etc</p>
                      </button>

                      {showDocumentUpload && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                          <input
                            type="file"
                            multiple
                            onChange={handleDocumentUpload}
                            className="w-full"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                          />
                          <p className="mt-2 text-xs text-slate-500">Formatos suportados: PDF, DOC, XLS</p>
                        </div>
                      )}

                      {uploadedDocuments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-slate-700">Documentos carregados:</p>
                          {uploadedDocuments.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                              <span className="text-green-700">{doc}</span>
                              <button
                                type="button"
                                onClick={() => setUploadedDocuments(prev => prev.filter((_, i) => i !== idx))}
                                className="text-green-600 hover:text-green-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Section */}
              {currentSection === "summary" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                  <div className="pb-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Revisão e Confirmação</h2>
                    <p className="mt-1 text-sm text-slate-600">Verifique os dados antes de guardar</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <SummaryCard
                      title="Informação Geral"
                      items={[
                        { label: "Fornecedor", value: formData.supplierName },
                        { label: "Categoria", value: formData.category },
                        { label: "NIF", value: formData.nif || "—" },
                        { label: "Estado", value: formData.status },
                        { label: "Tags", value: formData.tags.length > 0 ? formData.tags.join(", ") : "—" },
                      ]}
                    />

                    <SummaryCard
                      title="Contacto"
                      items={[
                        { label: "Pessoa", value: formData.contactPerson || "—" },
                        { label: "Email", value: formData.email || "—" },
                        { label: "Telefone", value: formData.phone || "—" },
                        { label: "Cargo", value: formData.position || "—" },
                      ]}
                    />

                    <SummaryCard
                      title="Morada"
                      items={[
                        { label: "Endereço", value: formData.address || "—" },
                        { label: "Cidade", value: formData.city || "—" },
                        { label: "Província", value: formData.province || "—" },
                      ]}
                    />

                    <SummaryCard
                      title="Comercial"
                      items={[
                        { label: "Prazo", value: formData.paymentTerm },
                        { label: "Método", value: formData.paymentMethod },
                        { label: "Limite", value: formData.creditLimit || "—" },
                        { label: "Website", value: formData.website || "—" },
                      ]}
                    />
                  </div>

                  {uploadedDocuments.length > 0 && (
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900 mb-2">Documentos anexados</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {uploadedDocuments.map((doc, idx) => (
                          <li key={idx}>• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formData.notes && (
                    <div className="rounded-lg bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-900 mb-2">Observações</p>
                      <p className="text-sm text-amber-800">{formData.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-200 bg-white py-6 px-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                {currentSection !== "summary" && (
                  <button
                    type="button"
                    onClick={() => {
                      const sectionIndex = SECTIONS.findIndex(s => s.id === currentSection);
                      if (sectionIndex < SECTIONS.length - 1) {
                        handleSectionChange(SECTIONS[sectionIndex + 1].id);
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 sm:ml-auto"
                  >
                    Próximo
                    <ChevronRight size={16} />
                  </button>
                )}

                {currentSection === "summary" && (
                  <button
                    type="button"
                    onClick={() => handleSectionChange("commercial")}
                    className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 sm:ml-auto"
                  >
                    ← Voltar
                  </button>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 sm:ml-auto"
                >
                  {submitting ? (
                    <>
                      <Clock size={16} className="animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar fornecedor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-2xl bg-white p-8 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Descartar alterações?</h3>
            <p className="text-slate-600 mb-6">Tem alterações não guardadas que serão perdidas.</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-900 hover:bg-slate-50"
              >
                Manter
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  items: Array<{ label: string; value: string }>;
}

function SummaryCard({ title, items }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}