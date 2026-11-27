import {
  ArrowUpRight,
  Clock3,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Sobre Nós", href: "/about" },
  { label: "Serviços", href: "/services" },
  { label: "Projectos", href: "/projects" },
  { label: "Contactos", href: "/contact" },
];

const services = [
  { label: "Arquitectura", href: "/services" },
  { label: "Engenharia", href: "/services" },
  { label: "Construção & Obras Públicas", href: "/services" },
  { label: "Fiscalização & Consultoria", href: "/services" },
];

// Preencher com os dados oficiais antes de publicar.
const footerConfig = {
  phone: "",
  email: "",
  whatsappUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  businessHours: "",
  briefingUrl: "/contact",
  privacyUrl: "", // Ex.: "/privacy" depois de publicar a página.
};

const linkClass =
  "text-sm text-[#F7F7F5]/75 transition-colors duration-300 hover:text-[#D7B477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B477]";

const headingClass =
  "mb-4 text-sm font-medium uppercase tracking-wider text-[#BD9655]";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#002950] text-[#F7F7F5] border-t border-white/15">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 ">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
          {/* Marca */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-2xl tracking-[0.16em] transition-colors hover:text-[#D7B477]"
            >
              PRO SOTA
            </Link>

            <p className="max-w-sm text-sm leading-6 text-[#F7F7F5]/75">
              Arquitectura, engenharia e construção. Soluções pensadas para
              transformar espaços e concretizar projectos.
            </p>
          </div>

          {/* Navegação */}
          <nav aria-label="Navegação do rodapé">
            <h2 className={headingClass}>Navegação</h2>
            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Serviços */}
          <nav aria-label="Serviços">
            <h2 className={headingClass}>Serviços</h2>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.label}>
                  <Link href={service.href} className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contactos */}
          <div>
            <h2 className={headingClass}>Contactos</h2>

            <address className="space-y-3 text-sm not-italic text-[#F7F7F5]/75">
              <p className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-[#BD9655]"
                  aria-hidden="true"
                />
                <span>
                  Lar do Patriota
                  <br />
                  Luanda, Angola
                </span>
              </p>

              {footerConfig.phone && (
                <a
                  href={`tel:${footerConfig.phone.replace(/[^\d+]/g, "")}`}
                  className={`${linkClass} flex items-center gap-2`}
                >
                  <Phone size={15} aria-hidden="true" />
                  {footerConfig.phone}
                </a>
              )}

              {footerConfig.email && (
                <a
                  href={`mailto:${footerConfig.email}`}
                  className={`${linkClass} flex items-center gap-2`}
                >
                  <Mail size={15} aria-hidden="true" />
                  {footerConfig.email}
                </a>
              )}

              <a
                href="https://maps.app.goo.gl/T8EU7FDNXQE1LPqc9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#BD9655] hover:text-[#D7B477]"
              >
                Ver localização
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>

              {footerConfig.businessHours && (
                <p className="flex items-start gap-2">
                  <Clock3 size={15} className="mt-0.5 shrink-0" />
                  <span>{footerConfig.businessHours}</span>
                </p>
              )}
            </address>

            <div className="mt-4 flex flex-wrap gap-4">
              {footerConfig.whatsappUrl && (
                <a
                  href={footerConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  WhatsApp
                </a>
              )}

              {footerConfig.linkedinUrl && (
                <a
                  href={footerConfig.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  LinkedIn
                </a>
              )}

              {footerConfig.instagramUrl && (
                <a
                  href={footerConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#F7F7F5]/60">
            © {year} PRO SOTA. Todos os direitos reservados.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            {footerConfig.privacyUrl && (
              <Link href={footerConfig.privacyUrl} className={linkClass}>
                Política de Privacidade
              </Link>
            )}

            <Link
              href="/management"
              className="inline-flex items-center gap-2 text-xs text-[#F7F7F5]/60 transition-colors hover:text-[#D7B477]"
            >
              <LockKeyhole size={13} aria-hidden="true" />
              Área Reservada
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}