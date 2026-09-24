"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface NavProps {
    dark?: boolean;
}

export default function Nav({ dark = false }: NavProps) {
    const [scrolled, setScrolled] = useState(dark);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 40);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    function closeMenu() {
        setOpen(false);
    }

    return (
        <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
            <Link href="/" className="nav__logo" onClick={closeMenu}>
                <Image
                    src="/assets/logo/logo-brand.png"
                    alt="PRO SOTA"
                    width={180}
                    height={60}
                    priority
                />
            </Link>

            <nav className={`nav__links${open ? " is-open" : ""}`}>
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
                className={`nav__burger${open ? " is-open" : ""}`}
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                aria-expanded={open}
                aria-controls="main-navigation"
                onClick={() => setOpen((value) => !value)}
            >
                <span />
                <span />
                <span />
            </button>
        </header>
    );
}