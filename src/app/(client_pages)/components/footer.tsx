
import { ArrowUpRight, LockKeyhole, MapPin } from "lucide-react";
import Link from "next/link";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Sobre Nós", href: "/about" },
  { label: "Serviços", href: "/services" },
  { label: "Projectos", href: "/projects" },
  { label: "Contactos", href: "/contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1F1E1B] text-[#F7F7F5]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-2xl tracking-[0.16em] text-[#F7F7F5] transition-colors duration-300 hover:text-[#D7B477]"
            >
              PRO SOTA
            </Link>

            <p className="max-w-sm text-sm leading-6 text-[#F7F7F5]/70">
              Arquitectura, engenharia e construção.
              Soluções pensadas para transformar espaços
              e concretizar projectos.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navegação do rodapé">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-[#BD9655]">
              Navegação
            </h2>

            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#F7F7F5]/70 transition-colors duration-300 hover:text-[#D7B477] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B477]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location */}
          <div>
            <h2 className="mb-4 text-sm uppercase tracking-wider text-[#BD9655]">
              Onde estamos
            </h2>

            <address className="not-italic text-sm leading-6 text-[#F7F7F5]/70">
              Lar do Patriota
              <br />
              Luanda, Angola
            </address>

            <Link
              href="https://maps.app.goo.gl/T8EU7FDNXQE1LPqc9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-[#BD9655] transition-colors duration-300 hover:text-[#D7B477] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B477]"
            >
              <MapPin
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className="shrink-0"
              />
              <span>Ver localização</span>
            </Link>
          </div>
        </div>

        {/* Copyright & Reserved Area */}
        <div className="mt-10 flex flex-col gap-4 border-t border-[#F7F7F5]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#F7F7F5]/50">
            © {year} PRO SOTA. Todos os direitos reservados.
          </p>

          <Link
            href="/management"
            className="inline-flex w-fit items-center gap-2 text-xs text-[#F7F7F5]/50 transition-colors duration-300 hover:text-[#D7B477] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D7B477]"
          >
            <LockKeyhole size={13} strokeWidth={1.5} aria-hidden="true" />
            Área Reservada
          </Link>
        </div>
      </div>
    </footer>
  );
}
