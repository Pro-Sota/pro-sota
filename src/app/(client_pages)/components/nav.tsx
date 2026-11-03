"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavProps = {
  // Kept so existing <Nav dark /> calls don't break. The header is always
  // light, so this no longer changes anything.
  dark?: boolean;
};

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Sobre nós", href: "/#sobre" },
  { label: "Serviços", href: "/services" },
  { label: "Projectos", href: "/projects" },
];

export default function Nav(_props: NavProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Shrink the header and add a shadow after scrolling
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape and lock page scroll while the mobile menu is open
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  function isActive(href: string) {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header
        className={`
          fixed inset-x-0 top-0 z-50 border-b bg-paper/90 backdrop-blur-xl
          transition-all duration-300
          ${
            scrolled
              ? "border-navy/10 shadow-[0_8px_30px_rgba(0,41,80,0.07)]"
              : "border-transparent"
          }
        `}
      >
        <div
          className={`
            mx-auto flex w-full max-w-[1600px] items-center justify-between
            px-6 transition-all duration-300 md:px-12 lg:px-16
            ${scrolled ? "h-16" : "h-[76px]"}
          `}
        >
          {/* LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="PRO SOTA — Página inicial"
            className="relative z-50 flex shrink-0 items-center"
          >
            <Image
              src="/images/logo-brand.png"
              alt="PRO SOTA"
              width={170}
              height={60}
              priority
              className={`
                h-auto object-contain transition-all duration-300
                ${scrolled ? "w-[120px] md:w-[132px]" : "w-[135px] md:w-[155px]"}
              `}
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-10 lg:flex"
          >
            {NAV_LINKS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group relative py-2 text-sm font-medium
                    transition-colors duration-300
                    focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-offset-4 focus-visible:outline-gold
                    ${
                      active
                        ? "text-navy"
                        : "text-navy/60 hover:text-navy"
                    }
                  `}
                >
                  {item.label}

                  <span
                    aria-hidden
                    className={`
                      absolute -bottom-0.5 left-0 h-0.5 w-full origin-left
                      bg-gold transition-transform duration-300
                      ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            className="
              relative z-50 -mr-2 flex size-11 flex-col items-center
              justify-center gap-[7px] lg:hidden
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-gold
            "
          >
            <span
              className={`
                h-0.5 w-6 bg-navy transition-transform duration-300
                ${open ? "translate-y-[4.5px] rotate-45" : ""}
              `}
            />
            <span
              className={`
                h-0.5 bg-navy transition-all duration-300
                ${open ? "w-6 -translate-y-[4.5px] -rotate-45" : "w-4 self-end mr-2.5"}
              `}
            />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}
      <div
        className={`
          fixed inset-0 z-40 bg-paper transition-all duration-500 lg:hidden
          ${
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-3 opacity-0"
          }
        `}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between px-6 pb-10 pt-28 md:px-12">
          <nav
            id="primary-navigation"
            aria-label="Navegação móvel"
            className="flex flex-col"
          >
            {NAV_LINKS.map((item, index) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  tabIndex={open ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  style={{ transitionDelay: open ? `${120 + index * 60}ms` : "0ms" }}
                  className={`
                    flex items-center gap-3 border-b border-navy/10 py-5
                    text-[2rem] font-semibold leading-none tracking-[-0.03em]
                    transition-all duration-500 motion-reduce:transition-none
                    ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
                    ${
                      active
                        ? "text-navy"
                        : "text-navy/50 hover:text-navy"
                    }
                  `}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="size-2 shrink-0 bg-gold"
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm text-navy/60">
            <span aria-hidden className="h-0.5 w-8 bg-gold" />
            Luanda, Angola
          </div>
        </div>
      </div>
    </>
  );
}