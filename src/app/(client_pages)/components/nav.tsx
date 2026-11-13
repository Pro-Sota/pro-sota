
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/about" },
  { label: "Serviços", href: "/services" },
  { label: "Projectos", href: "/projects" },
];

const MIN_PROGRESS_DURATION = 1200;
const NAVIGATION_TIMEOUT = 12000;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const navigationStartedAt = useRef<number | null>(null);
  const previousPathname = useRef(pathname);

  const hideProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* -------------------------------------------------------------------------- */
  /* Navigation feedback                                                        */
  /* -------------------------------------------------------------------------- */

  const clearNavigationTimers = () => {
    if (hideProgressTimer.current) {
      clearTimeout(hideProgressTimer.current);
      hideProgressTimer.current = null;
    }

    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  };

  const handleNavigationClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // Respect modified clicks, external targets and prevented navigation.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (event.currentTarget.target &&
        event.currentTarget.target !== "_self")
    ) {
      return;
    }

    const destination = new URL(href, window.location.href);

    // Ignore external URLs and links to the current pathname.
    if (
      destination.origin !== window.location.origin ||
      destination.pathname === pathname
    ) {
      return;
    }

    clearNavigationTimers();

    navigationStartedAt.current = Date.now();

    setNavigating(true);

    // Safety fallback if navigation fails or is interrupted.
    safetyTimer.current = setTimeout(() => {
      navigationStartedAt.current = null;
      setNavigating(false);
      safetyTimer.current = null;
    }, NAVIGATION_TIMEOUT);
  };

  /* -------------------------------------------------------------------------- */
  /* Finish progress after destination changes                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;

    if (navigationStartedAt.current === null) return;

    const elapsed = Date.now() - navigationStartedAt.current;

    const remaining = Math.max(
      0,
      MIN_PROGRESS_DURATION - elapsed
    );

    navigationStartedAt.current = null;

    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }

    if (remaining === 0) {
      setNavigating(false);
      return;
    }

    hideProgressTimer.current = setTimeout(() => {
      setNavigating(false);
      hideProgressTimer.current = null;
    }, remaining);
  }, [pathname]);

  /* -------------------------------------------------------------------------- */
  /* Cleanup                                                                    */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      clearNavigationTimers();
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Scroll state                                                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
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
  /* Close menu on navigation                                                   */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* -------------------------------------------------------------------------- */
  /* Mobile menu accessibility                                                  */
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
    <>
      {/* Navigation progress indicator */}

      {navigating && (
        <>
          <span
            className="public-navigation-progress"
            aria-hidden="true"
          />

          <span className="sr-only" role="status" aria-live="polite">
            A carregar página...
          </span>
        </>
      )}

      <header
        className={`
          fixed inset-x-0 top-0 z-[100] isolate
          flex items-center justify-between
          min-h-[76px] px-5 py-3
          min-[861px]:min-h-[84px]
          min-[861px]:px-[clamp(20px,5vw,64px)]
          transition-[background-color,box-shadow] duration-300
          ${
            scrolled
              ? "bg-[#F7F7F5] shadow-[0_4px_20px_rgba(0,41,80,0.06)]"
              : "bg-transparent shadow-none"
          }
        `}
      >
        {/* Logo */}

        <Link
          href="/"
          onClick={(event) => {
            setOpen(false);
            handleNavigationClick(event, "/");
          }}
          aria-label="PRO SOTA - Página inicial"
          className="
            relative z-[130] block shrink-0 overflow-hidden
            h-[44px] w-[155px]
            min-[861px]:h-[48px] min-[861px]:w-[180px]
            focus-visible:outline-2
            focus-visible:outline-offset-4
            focus-visible:outline-[#BD9655]
            active:opacity-70
            transition-opacity duration-150
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
              h-auto w-full max-w-none
              -translate-x-1/2 -translate-y-1/2
              object-contain
            "
          />
        </Link>

        {/* Navigation */}

        <nav
          id="mobile-navigation"
          aria-label="Navegação principal"
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
            min-[861px]:gap-[clamp(14px,1.8vw,30px)]
            min-[861px]:overflow-visible
            min-[861px]:bg-transparent
            min-[861px]:px-0
            min-[861px]:transition-none
            ${
              open
                ? "visible translate-x-0"
                : "invisible translate-x-full min-[861px]:visible min-[861px]:translate-x-0"
            }
          `}
        >
          {links.map((link) => {
            const isActive = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(event) => {
                  setOpen(false);
                  handleNavigationClick(event, link.href);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`
                  !no-underline
                  text-[24px] font-semibold
                  transition-colors duration-300
                  active:opacity-60
                  min-[861px]:text-[12.5px]
                  min-[861px]:whitespace-nowrap
                  ${
                    isActive
                      ? "text-[#BD9655]"
                      : "text-[#002950] hover:text-[#BD9655]"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Contact CTA */}

          <Link
            href="/contact"
            onClick={(event) => {
              setOpen(false);
              handleNavigationClick(event, "/contact");
            }}
            aria-current={
              pathname === "/contact" ? "page" : undefined
            }
            className="
              inline-flex items-center justify-center
              border border-[#BD9655]
              bg-transparent px-6 py-3
              text-[15px] font-semibold
              !text-[#002950]
              transition-[background-color,color,opacity] duration-300
              hover:!bg-[#BD9655] hover:!text-[#051221]
              active:opacity-70
              aria-[current=page]:!bg-[#BD9655]
              aria-[current=page]:!text-[#051221]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-[#BD9655]
              min-[861px]:px-[18px]
              min-[861px]:py-[9px]
              min-[861px]:text-[12.5px]
              min-[861px]:whitespace-nowrap
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
              ${
                open
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
              ${
                open
                  ? "-translate-y-[7px] -rotate-45 !bg-[#BD9655]"
                  : ""
              }
            `}
          />
        </button>
      </header>
    </>
  );
}
