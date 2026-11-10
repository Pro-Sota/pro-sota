
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/about" },
  { label: "Serviços", href: "/services" },
  { label: "Projectos", href: "/projects" },
];

export default function Nav() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Scroll state                                                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > -40 );
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Close menu on navigation                                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* -------------------------------------------------------------------------- */
  /* Mobile menu accessibility                                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-[100] isolate
        flex items-center justify-between
        min-h-[76px] px-5 py-3
        min-[861px]:min-h-[84px]
        min-[861px]:px-[clamp(20px,5vw,64px)]
        transition-[background-color,box-shadow] duration-300
        ${scrolled
          ? "bg-[#F7F7F5] shadow-[0_4px_20px_rgba(0,41,80,0.06)]"
          : "bg-transparent shadow-none"
        }
      `}
    >
      {/* Logo */}
      <Link
        href="/"
        onClick={() => setOpen(false)}
        aria-label="PRO SOTA - Página inicial"
        className="
          relative z-[130] block shrink-0 overflow-hidden
          h-[52px] w-[180px]
          min-[861px]:h-[60px] min-[861px]:w-[210px]
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-[#BD9655]
        "
      >
        <Image
          src="/images/logo-horizontal.png"
          alt="PRO SOTA"
          width={210}
          height={70}
          priority
          className="
            absolute left-1/2 top-1/2
            h-auto w-[120%] max-w-none
            -translate-x-1/2 -translate-y-1/2
          "
        />
      </Link>

      {/* Navigation */}
      <nav
        id="mobile-navigation"
        aria-label="Navegação principal"
        aria-hidden={!open ? undefined : undefined}
        className={`
          fixed inset-0 z-[110]
          flex h-[100dvh] w-full
          flex-col items-start justify-center gap-8
          overflow-y-auto overscroll-contain
          bg-[#F7F7F5]
          px-10
          transition-[transform,visibility] duration-500
          ease-[cubic-bezier(.16,.84,.44,1)]
          min-[861px]:static min-[861px]:z-auto
          min-[861px]:h-auto min-[861px]:w-auto
          min-[861px]:flex-row min-[861px]:items-center
          min-[861px]:justify-end
          min-[861px]:gap-[clamp(18px,2.4vw,38px)]
          min-[861px]:overflow-visible
          min-[861px]:bg-transparent
          min-[861px]:px-0
          min-[861px]:transition-none
          ${open
            ? "visible translate-x-0"
            : "invisible translate-x-full min-[861px]:visible min-[861px]:translate-x-0"
          }
        `}
      >
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className={`
        !no-underline
        text-[24px] font-semibold
        transition-colors duration-300
        ${isActive
                  ? "text-[#BD9655]"
                  : "text-[#002950] hover:text-[#BD9655]"
                }
      `}
            >
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          aria-current={pathname === "/contact" ? "page" : undefined}
          className="
            inline-flex items-center justify-center
            border border-[#BD9655]
            bg-transparent px-6 py-3
            text-[15px] font-semibold
            !text-[#002950]
            transition-colors duration-300
            hover:!bg-[#BD9655] hover:!text-[#051221]
            focus-visible:outline-2
            focus-visible:outline-offset-4
            focus-visible:outline-[#BD9655]
            min-[861px]:px-[18px]
            min-[861px]:py-[9px]
            min-[861px]:text-[12.5px]
          "
        >
          Fale connosco
        </Link>
      </nav>

      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="
          relative z-[130]
          flex h-10 w-10 flex-col
          items-center justify-center
          gap-[5px] p-2
          transition-colors duration-300
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-[#BD9655]
          min-[861px]:hidden
        "
      >
        <span
          className={`
            h-[2px] w-6 bg-[#002950]
            transition-all duration-300
            ${open
              ? "translate-y-[7px] rotate-45 !bg-[#BD9655]"
              : ""
            }
          `}
        />

        <span
          className={`
            h-[2px] w-6 bg-[#002950]
            transition-opacity duration-300
            ${open ? "opacity-0" : ""}
          `}
        />

        <span
          className={`
            h-[2px] w-6 bg-[#002950]
            transition-all duration-300
            ${open
              ? "-translate-y-[7px] -rotate-45 !bg-[#BD9655]"
              : ""
            }
          `}
        />
      </button>
    </header>
  );
}
