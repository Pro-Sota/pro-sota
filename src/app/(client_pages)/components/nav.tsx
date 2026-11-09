
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavProps {
  dark?: boolean;
}

const links = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/about" },
  { label: "Serviços", href: "/services" },
  { label: "Projectos", href: "/projects" },
];

export default function Nav({ dark = false }: NavProps) {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(dark);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dark) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [dark]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header
      className={`
    fixed inset-x-0 top-0 z-[100] isolate
    flex items-center justify-between
    min-h-[76px] px-5 py-3
    min-[861px]:min-h-[84px]
    min-[861px]:px-[clamp(20px,5vw,64px)]
    transition-colors duration-300
    ${scrolled
          ? "bg-[#051221]/95 shadow-lg backdrop-blur-xl"
          : "bg-transparent"
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
        "
      >
        <Image
          src="/images/logo-brand.png"
          alt="PRO SOTA"
          width={210}
          height={70}
          priority
          className="
            absolute left-1/2 top-1/2
            h-auto w-[120%] max-w-none
            -translate-x-1/2 -translate-y-1/2
            [mix-blend-mode:screen]
          "
        />
      </Link>

      {/* Navigation */}
      <nav
        id="mobile-navigation"
        aria-label="Navegação principal"
        className={`
          fixed left-0 top-0 z-[110]
          flex h-[100dvh] w-full
          flex-col items-start justify-center gap-8
          overflow-y-auto bg-[#051221]
          px-10
          transition-transform duration-500
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
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href ||
              pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              style={{
                color: active ? "#E2C690" : "#FAF8F3",
                textDecoration: "none",
              }}
              className="
    !no-underline
    text-[24px] font-semibold tracking-wide
    transition-colors duration-300
    hover:!text-[#E2C690]
    min-[861px]:text-[13.5px]
  "
            >
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          aria-current={pathname === "/contact" ? "page" : undefined}
          style={{
            color: "#E2C690",
          }}
          className="
            inline-flex items-center justify-center
            border border-[#BD9655]
            bg-transparent px-6 py-3
            text-[15px] font-semibold
            transition-colors duration-300
            hover:!bg-[#BD9655] hover:!text-[#051221]
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
          flex flex-col items-center justify-center
          gap-[5px] p-3
          min-[861px]:hidden
        "
      >
        <span
          className={`
            h-[2px] w-6 bg-[#FAF8F3]
            transition-transform duration-300
            ${open ? "translate-y-[7px] rotate-45" : ""}
          `}
        />

        <span
          className={`
            h-[2px] w-6 bg-[#FAF8F3]
            transition-opacity duration-300
            ${open ? "opacity-0" : ""}
          `}
        />

        <span
          className={`
            h-[2px] w-6 bg-[#FAF8F3]
            transition-transform duration-300
            ${open ? "-translate-y-[7px] -rotate-45" : ""}
          `}
        />
      </button>
    </header>
  );
}
