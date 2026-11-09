
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

  // Scroll state
  useEffect(() => {
    if (dark) {
      setScrolled(true);
      return;
    }

    function onScroll() {
      setScrolled(window.scrollY > 40);
    }

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [dark]);

  // Close menu when navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
      <Link
        href="/"
        className="nav__logo"
        onClick={closeMenu}
        aria-label="PRO SOTA - Página inicial"
      >
        <Image
          src="/images/logo-brand.png"
          alt="PRO SOTA"
          width={180}
          height={60}
          priority
        />
      </Link>

      <nav
        id="mobile-navigation"
        className={`nav__links${open ? " is-open" : ""}`}
        aria-label="Navegação principal"
        aria-hidden={!open}
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
              onClick={closeMenu}
              aria-current={active ? "page" : undefined}
              tabIndex={open || typeof window === "undefined" || window.innerWidth > 900 ? 0 : -1}
            >
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/contact"
          className="nav__cta"
          onClick={closeMenu}
          aria-current={pathname === "/contact" ? "page" : undefined}
        >
          Fale connosco
        </Link>
      </nav>

      <button
        type="button"
        className={`nav__burger${open ? " is-open" : ""}`}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
