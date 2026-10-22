
import Link from "next/link";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/servicos" },
  { label: "Projectos", href: "/projectos" },
  { label: "Sobre Nós", href: "/sobre-nos" },
  { label: "Contactos", href: "/contactos" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-[0.16em]"
            >
              PRO SOTA
            </Link>

            <p className="max-w-sm text-sm leading-6 text-white/75">
              Arquitectura, engenharia e construção.
              Soluções pensadas para transformar espaços
              e concretizar projectos.
            </p>

            <p className="text-sm font-medium text-[#BD9655]">
              Angola · Desde 1997
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navegação do rodapé">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#BD9655]">
              Explorar
            </h2>

            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/75 transition-colors hover:text-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#BD9655]">
              Onde estamos
            </h2>

            <address className="not-italic text-sm leading-6 text-white/75">
              Lar do Patriota
              <br />
              Luanda, Angola
            </address>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Lar+do+Patriota%2C+Luanda%2C+Angola"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-[#BD9655] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655]"
            >
              Ver localização
              <span className="ml-1" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/15 pt-6">
          <p className="text-xs leading-5 text-white/60">
            © {year} PRO SOTA. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
