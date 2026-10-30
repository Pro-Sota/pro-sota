
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import "../../admin.css";
import "../../styles.css";

type NavProps = {
  dark?: boolean;
};

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Sobre nós", href: "/#sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Portefólio", href: "/portfolio" },
];

export default function Nav({ dark = false }: NavProps) {
  const [scrolled, setScrolled] = useState(dark);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40 || dark);
    }

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [dark]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <header
        className={`
          fixed inset-x-0 top-0 z-50
          transition-all duration-300
          ${
            scrolled
              ? "border-b border-[#002950]/10 bg-[#F7F7F5]/95 shadow-[0_4px_24px_rgba(0,41,80,0.04)] backdrop-blur-xl"
              : "border-b border-white/10 bg-transparent"
          }
        `}
      >
        <div className="mx-auto flex h-[82px] w-full max-w-[1600px] items-center justify-between px-6 md:px-12 lg:px-20">

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
                h-auto w-[135px] object-contain transition-all duration-300 md:w-[155px]
                ${!scrolled ? "brightness-0 invert" : ""}
              `}
            />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-8 lg:flex xl:gap-10"
          >
            {NAV_LINKS.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  group relative py-3 text-[12px] font-medium tracking-wide
                  transition-colors duration-300
                  ${
                    scrolled
                      ? "text-[#002950]/70 hover:text-[#002950]"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                {item.label}

                <span
                  className="
                    absolute bottom-0 left-0 h-px w-0
                    bg-[#BD9655]
                    transition-all duration-300
                    group-hover:w-full
                  "
                />

                <span className="sr-only">
                  {index + 1}
                </span>
              </Link>
            ))}
          </nav>

          {/* DESKTOP CTA */}

          <Link
            href="/#contacto"
            className={`
              hidden h-11 items-center gap-4 px-5
              text-[10px] font-semibold uppercase tracking-[0.14em]
              transition-all duration-300 lg:inline-flex
              ${
                scrolled
                  ? "bg-[#002950] text-white hover:bg-[#BD9655]"
                  : "border border-white/40 text-white hover:border-[#BD9655] hover:bg-[#BD9655]"
              }
            `}
          >
            Pedir orçamento

            <span className="text-sm transition-transform duration-300 hover:translate-x-1">
              ↗
            </span>
          </Link>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            className={`
              relative z-50 flex size-11 flex-col
              items-center justify-center gap-[6px]
              border transition-colors duration-300 lg:hidden
              ${
                scrolled
                  ? "border-[#002950]/15"
                  : "border-white/30"
              }
            `}
          >
            <span
              className={`
                h-px w-5 transition-all duration-300
                ${
                  scrolled ? "bg-[#002950]" : "bg-white"
                }
                ${
                  open
                    ? "translate-y-[3.5px] rotate-45"
                    : ""
                }
              `}
            />

            <span
              className={`
                h-px w-5 transition-all duration-300
                ${
                  scrolled ? "bg-[#002950]" : "bg-white"
                }
                ${
                  open
                    ? "-translate-y-[3.5px] -rotate-45"
                    : ""
                }
              `}
            />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}

      <div
        className={`
          fixed inset-0 z-40 bg-[#F7F7F5]
          transition-all duration-500 lg:hidden
          ${
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-3 opacity-0"
          }
        `}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between px-6 pb-10 pt-32 md:px-12">
          <nav
            id="primary-navigation"
            aria-label="Navegação móvel"
            className="flex flex-col"
          >
            {NAV_LINKS.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                tabIndex={open ? 0 : -1}
                className="
                  group flex items-center justify-between
                  border-b border-[#002950]/10 py-6
                  text-2xl font-medium tracking-tight text-[#002950]
                  transition-colors hover:text-[#BD9655]
                "
              >
                {item.label}

                <span className="text-xs font-medium tracking-wider text-[#BD9655]">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </nav>

          <div>
            <Link
              href="/#contacto"
              onClick={closeMenu}
              tabIndex={open ? 0 : -1}
              className="
                flex h-14 items-center justify-between
                bg-[#002950] px-6
                text-xs font-semibold uppercase tracking-[0.14em]
                text-white transition-colors hover:bg-[#BD9655]
              "
            >
              Pedir orçamento
              <span>↗</span>
            </Link>

            <div className="mt-8 flex items-center justify-between border-t border-[#002950]/10 pt-5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#002950]/50">
                Arquitectura · Engenharia · Construção
              </span>

              <span className="text-[10px] text-[#002950]/40">
                Luanda, Angola
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
