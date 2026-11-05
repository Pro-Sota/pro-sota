"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavProps {
  dark?: boolean;
}

export default function Nav({ dark = false }: NavProps) {
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
        className={`nav__links${open ? " is-open" : ""}`}
        aria-label="Navegação principal"
      >
        <Link href="/" onClick={closeMenu}>
          Início
        </Link>

        <Link href="/#sobre" onClick={closeMenu}>
          Sobre
        </Link>

        <Link href="/services" onClick={closeMenu}>
          Serviços
        </Link>

        <Link href="/projects" onClick={closeMenu}>
          Projectos
        </Link>

        <Link
          href="/#contacto"
          className="nav__cta"
          onClick={closeMenu}
        >
          Pedir Orçamento
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