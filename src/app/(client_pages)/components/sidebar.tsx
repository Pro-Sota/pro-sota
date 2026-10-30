"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  ["sobre", "Sobre nós"],
  ["servicos", "Serviços"],
  ["portefolio", "Portefólio"],
  ["contacto", "Contacto"],
] as const;

export default function Sidebar() {
  const [active, setActive] = useState<string>("sobre");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ITEMS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const list = (
    <ul className="space-y-1">
      {ITEMS.map(([id, label]) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={() => setOpen(false)}
            aria-current={active === id ? "true" : undefined}
            className={`flex items-center gap-3 py-1.5 text-2xl font-medium tracking-tight transition-colors lg:text-xl ${
              active === id ? "text-ink" : "text-mute hover:text-ink"
            }`}
          >
            <span
              className={`h-px transition-all duration-300 ${
                active === id ? "w-8 bg-gold" : "w-3 bg-line"
              }`}
              aria-hidden="true"
            />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop: fixed index column */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between border-r border-line bg-white p-8 lg:flex">
        <a href="#top" aria-label="PRO SOTA — início">
          <img src="/images/logo-brand.png" alt="PRO SOTA" className="h-9 w-auto" />
        </a>
        <nav aria-label="Secções">{list}</nav>
        <div className="space-y-1 text-sm text-mute">
          <p>Lar do Patriota, Luanda</p>
          <a className="block hover:text-ink" href="tel:+244947803610">+244 947 803 610</a>
          <a className="block hover:text-ink" href="mailto:geral@prosota.ao">geral@prosota.ao</a>
        </div>
      </aside>

      {/* Mobile: top bar + full-screen menu */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white/90 px-5 py-3 backdrop-blur lg:hidden">
        <a href="#top" aria-label="PRO SOTA — início">
          <img src="/images/logo-brand.png" alt="PRO SOTA" className="h-7 w-auto" />
        </a>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
          className="rounded-full border border-line px-4 py-1.5 text-sm font-medium"
        >
          {open ? "Fechar" : "Menu"}
        </button>
      </header>
      {open && (
        <nav id="mobile-menu" aria-label="Secções" className="fixed inset-x-0 top-[57px] bottom-0 z-30 bg-white p-6 lg:hidden">
          {list}
        </nav>
      )}
    </>
  );
}