
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavProps = {
  dark?: boolean;
};

export default function Nav({ dark = false }: NavProps) {
  const [scrolled, setScrolled] = useState(dark);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40 || dark);
    }

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [dark]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header
      className={"nav" + (scrolled ? " is-scrolled" : "")}
    >
      <Link
        href="/"
        className="nav__logo"
        onClick={closeMenu}
        aria-label="PRO SOTA — Página inicial"
      >
        <img src="/assets/logo/logo-brand.png" alt="PRO SOTA" />
      </Link>

      <nav
        id="primary-navigation"
        className={"nav__links" + (open ? " is-open" : "")}
        aria-label="Navegação principal"
      >
        <Link href="/" onClick={closeMenu}>
          Início
        </Link>

        <Link href="/#sobre" onClick={closeMenu}>
          Sobre
        </Link>

        <Link href="/servicos" onClick={closeMenu}>
          Serviços
        </Link>

        <Link href="/portfolio" onClick={closeMenu}>
          Portefólio
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
        className={"nav__burger" + (open ? " is-open" : "")}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
