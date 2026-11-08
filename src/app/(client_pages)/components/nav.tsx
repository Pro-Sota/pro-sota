
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavProps {
  dark?: boolean;
}

export default function Nav({ dark = false }: NavProps) {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(dark);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(dark || window.scrollY > 40);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [dark]);

  function closeMenu() {
    setOpen(false);
  }

  const links = [
    { label: "Início", href: "/" },
    { label: "Sobre", href: "/about" },
    { label: "Serviços", href: "/services" },
    { label: "Projectos", href: "/projects" },
  ];

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
