
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Users,
} from "lucide-react";

type Attachment = {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  download_url: string | null;
};

type Briefing = {
  id: string;
  created_at: string;
  status: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  decision_makers?: string | null;
  preferred_contact_method?: string | null;

  address?: string | null;
  neighborhood?: string | null;
  municipality?: string | null;
  reference_point?: string | null;
  city?: string | null;
  province?: string | null;
  map_url?: string | null;

  owns_land?: string | null;
  land_area_m2?: number | null;
  land_length_m?: number | null;
  land_width_m?: number | null;
  land_type?: string | null;
  existing_constructions?: string | null;
  has_trees?: string | null;
  existing_infrastructure?: string[] | null;

  residents_count?: number | null;
  has_domestic_workers?: string | null;
  domestic_workers_count?: number | null;
  resident_profiles?: string | null;
  family_growth?: string | null;
  works_from_home?: string | null;
  receives_visitors?: string | null;
  pets?: string | null;
  current_home_dislikes?: string | null;
  current_home_likes?: string | null;

  bedrooms_count?: number | null;
  suites_count?: number | null;
  desired_spaces?: string[] | null;
  garage_cars?: number | null;
  kitchen_layout?: string | null;
  floors?: string | null;
  essential_spaces?: string | null;

  architectural_style?: string | null;
  preferred_materials?: string | null;
  natural_light_rating?: number | null;
  privacy_rating?: number | null;
  reference_links?: string[] | null;
  additional_notes?: string | null;

  internal_notes?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
};

type Props = {
  briefing: Briefing;
  attachments: Attachment[];
};

const statusLabels: Record<string, string> = {
  pending: "Novo",
  in_review: "Em análise",
  contacted: "Contactado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  converted: "Convertido em projecto",
};

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Não indicado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Não indicado";
  return String(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "long",
    timeZone: "Africa/Luanda",
  }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Tamanho desconhecido";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#002950]/5 text-[#BD9655]">
          {icon}
        </span>
        <div>
          <h2 className="font-semibold text-[#002950]">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: unknown;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {display(value)}
      </p>
    </div>
  );
}

function RatingField({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  const rating = Number(value ?? 0);

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((number) => (
          <span
            key={number}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
              number <= rating
                ? "bg-[#BD9655] text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {number}
          </span>
        ))}
        <span className="ml-2 text-xs text-slate-500">
          {value ? `${value}/5` : "Não indicado"}
        </span>
      </div>
    </div>
  );
}

export default function BriefingSummary({
  briefing,
  attachments,
}: Props) {
  const status = briefing.status ?? "pending";

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    in_review: "bg-blue-50 text-blue-800 ring-blue-200",
    contacted: "bg-violet-50 text-violet-800 ring-violet-200",
    approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    rejected: "bg-red-50 text-red-800 ring-red-200",
    converted: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="bg-[#002950] px-5 py-6 text-white sm:px-7 sm:py-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#D6B77F]">
                Briefing de arquitectura residencial
              </p>

              <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {briefing.full_name || "Cliente sem nome"}
              </h1>

              <p className="mt-2 text-sm text-white/65">
                Referência {briefing.id.slice(0, 8).toUpperCase()}
                {" · "}
                Recebido a {formatDate(briefing.created_at)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                statusStyles[status] ?? statusStyles.pending
              }`}
            >
              {statusLabels[status] ?? status}
            </span>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
            <div className="flex min-w-0 items-start gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-[#D6B77F]" />
              <div className="min-w-0">
                <p className="text-xs text-white/55">Telefone</p>
                {briefing.phone ? (
                  <a
                    href={`tel:${briefing.phone}`}
                    className="mt-1 block break-words text-sm hover:underline"
                  >
                    {briefing.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-sm">Não indicado</p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3">
              <Mail size={17} className="mt-0.5 shrink-0 text-[#D6B77F]" />
              <div className="min-w-0">
                <p className="text-xs text-white/55">Email</p>
                {briefing.email ? (
                  <a
                    href={`mailto:${briefing.email}`}
                    className="mt-1 block break-all text-sm hover:underline"
                  >
                    {briefing.email}
                  </a>
                ) : (
                  <p className="mt-1 text-sm">Não indicado</p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-[#D6B77F]" />
              <div className="min-w-0">
                <p className="text-xs text-white/55">Localização</p>
                <p className="mt-1 break-words text-sm">
                  {[briefing.municipality, briefing.province]
                    .filter(Boolean)
                    .join(", ") || "Não indicada"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
          <p className="text-sm text-slate-500">
            Consulte as respostas e os documentos enviados pelo cliente.
          </p>

          {briefing.map_url && (
            <a
              href={briefing.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#002950] hover:text-[#BD9655]"
            >
              Ver localização no mapa
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Section
            title="Cliente e contacto"
            description="Identificação, decisores e comunicação preferida."
            icon={<Users size={19} />}
          >
            <Field label="Nome completo" value={briefing.full_name} />
            <Field label="Telefone" value={briefing.phone} />
            <Field label="Email" value={briefing.email} />
            <Field
              label="Quem toma as decisões"
              value={briefing.decision_makers}
            />
            <Field
              label="Forma preferida de contacto"
              value={briefing.preferred_contact_method}
            />
          </Section>

          <Section
            title="Terreno e localização"
            description="Informação sobre o lote, documentação e infra-estruturas."
            icon={<MapPin size={19} />}
          >
            <Field label="Endereço" value={briefing.address} />
            <Field label="Bairro" value={briefing.neighborhood} />
            <Field label="Município" value={briefing.municipality} />
            <Field label="Cidade" value={briefing.city} />
            <Field label="Província" value={briefing.province} />
            <Field label="Ponto de referência" value={briefing.reference_point} />
            <Field label="Já é proprietário?" value={briefing.owns_land} />
            <Field label="Tipo de terreno" value={briefing.land_type} />
            <Field
              label="Área aproximada"
              value={
                briefing.land_area_m2 != null
                  ? `${briefing.land_area_m2} m²`
                  : null
              }
            />
            <Field
              label="Comprimento"
              value={
                briefing.land_length_m != null
                  ? `${briefing.land_length_m} m`
                  : null
              }
            />
            <Field
              label="Largura"
              value={
                briefing.land_width_m != null
                  ? `${briefing.land_width_m} m`
                  : null
              }
            />
            <Field
              label="Construções existentes"
              value={briefing.existing_constructions}
            />
            <Field label="Árvores no terreno" value={briefing.has_trees} />
            <Field
              label="Infra-estruturas existentes"
              value={briefing.existing_infrastructure}
              fullWidth
            />
          </Section>

          <Section
            title="Família e estilo de vida"
            description="Necessidades actuais, composição familiar e planos futuros."
            icon={<Users size={19} />}
          >
            <Field label="Número de moradores" value={briefing.residents_count} />
            <Field
              label="Trabalhadores domésticos"
              value={briefing.has_domestic_workers}
            />
            <Field
              label="Número de trabalhadores"
              value={briefing.domestic_workers_count}
            />
            <Field
              label="Idades e perfis dos moradores"
              value={briefing.resident_profiles}
              fullWidth
            />
            <Field
              label="Crescimento familiar nos próximos 10 anos"
              value={briefing.family_growth}
            />
            <Field
              label="Trabalha em casa"
              value={briefing.works_from_home}
            />
            <Field
              label="Frequência de visitas e eventos"
              value={briefing.receives_visitors}
            />
            <Field label="Animais de estimação" value={briefing.pets} />
            <Field
              label="O que mais incomoda na casa actual"
              value={briefing.current_home_dislikes}
              fullWidth
            />
            <Field
              label="O que mais gosta na casa actual"
              value={briefing.current_home_likes}
              fullWidth
            />
          </Section>

          <Section
            title="Programa arquitectónico"
            description="Compartimentos, organização e espaços pretendidos."
            icon={<ClipboardList size={19} />}
          >
            <Field label="Número de quartos" value={briefing.bedrooms_count} />
            <Field label="Número de suites" value={briefing.suites_count} />
            <Field label="Número de viaturas" value={briefing.garage_cars} />
            <Field label="Número de pisos" value={briefing.floors} />
            <Field
              label="Preferência de cozinha"
              value={briefing.kitchen_layout}
            />
            <Field
              label="Espaços desejados"
              value={briefing.desired_spaces}
              fullWidth
            />
            <Field
              label="Espaços indispensáveis adicionais"
              value={briefing.essential_spaces}
              fullWidth
            />
          </Section>

          <Section
            title="Estilo e preferências"
            description="Referências estéticas, materiais, iluminação e privacidade."
            icon={<CheckCircle2 size={19} />}
          >
            <Field
              label="Estilo arquitectónico"
              value={briefing.architectural_style}
            />
            <Field
              label="Cores e materiais preferidos ou a evitar"
              value={briefing.preferred_materials}
              fullWidth
            />
            <RatingField
              label="Importância da luz natural e ligação ao exterior"
              value={briefing.natural_light_rating}
            />
            <RatingField
              label="Importância da privacidade"
              value={briefing.privacy_rating}
            />
            <Field
              label="Observações adicionais do cliente"
              value={briefing.additional_notes}
              fullWidth
            />

            {briefing.reference_links?.length ? (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Links de referência
                </p>
                <ul className="mt-2 space-y-2">
                  {briefing.reference_links.map((url, index) => (
                    <li key={`${url}-${index}`}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-2 break-all text-sm text-[#002950] hover:text-[#BD9655]"
                      >
                        <ArrowUpRight size={15} className="shrink-0" />
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Section>

          <Section
            title="Anexos do cliente"
            description="Fotografias do terreno, documentos e imagens de inspiração."
            icon={<FileText size={19} />}
          >
            {attachments.length === 0 ? (
              <div className="sm:col-span-2">
                <p className="text-sm text-slate-500">
                  Não foram enviados anexos.
                </p>
              </div>
            ) : (
              attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#BD9655]">
                    <FileText size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-slate-700">
                      {attachment.original_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>

                  {attachment.download_url && (
                    <a
                      href={attachment.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${attachment.original_name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#002950] transition hover:bg-slate-100"
                    >
                      <Download size={17} />
                    </a>
                  )}
                </div>
              ))
            )}
          </Section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquareText size={19} className="text-[#BD9655]" />
              <h2 className="font-semibold text-[#002950]">
                Revisão interna
              </h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Registe as conclusões da avaliação e acompanhe os próximos passos.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Estado actual
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-700">
                  {statusLabels[status] ?? status}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Última revisão
                </p>
                <p className="mt-1.5 text-sm text-slate-700">
                  {briefing.reviewed_at
                    ? formatDate(briefing.reviewed_at)
                    : "Ainda não revisto"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Notas internas
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {briefing.internal_notes || "Ainda não existem notas internas."}
                </p>
              </div>

              {briefing.rejection_reason && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Motivo de rejeição
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    {briefing.rejection_reason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs leading-5 text-slate-400">
                A edição do estado e das notas deve ser ligada a uma Server
                Action com validação de permissões.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#BD9655]/25 bg-[#BD9655]/5 p-5">
            <h3 className="font-semibold text-[#002950]">
              Contactar o cliente
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Utilize o contacto fornecido para esclarecer dúvidas sobre o
              terreno e o programa arquitectónico.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {briefing.phone && (
                <a
                  href={`tel:${briefing.phone}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#002950] px-4 text-sm font-medium text-white transition hover:bg-[#003968]"
                >
                  <Phone size={16} />
                  Ligar ao cliente
                </a>
              )}

              {briefing.email && (
                <a
                  href={`mailto:${briefing.email}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#002950] transition hover:bg-slate-50"
                >
                  <Mail size={16} />
                  Enviar email
                </a>
              )}

              {briefing.map_url && (
                <a
                  href={briefing.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-[#002950] transition hover:bg-slate-50"
                >
                  <MapPin size={16} />
                  Abrir mapa
                </a>
              )}
            </div>
          </section>

          <Link
            href="/management/project-briefs"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-[#BD9655]/50 hover:text-[#002950]"
          >
            <ClipboardList size={16} />
            Todos os briefings
          </Link>
        </aside>
      </div>
    </div>
  );
}
