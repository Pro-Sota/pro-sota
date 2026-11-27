import type { Metadata, Viewport } from "next";

import {
  Manrope,
  IBM_Plex_Mono,
} from "next/font/google";

import "./globals.css";
import "./admin.css";
import "./hero.css";
import "./styles.css";
import "leaflet/dist/leaflet.css";

import { ToastProvider } from "./components/toast/toast_provider";
import OrganizationSchema from "./components/organization_schema";
import { Analytics } from "@vercel/analytics/next";

/* -------------------------------------------------------------------------- */
/* Fonts                                                                      */
/* -------------------------------------------------------------------------- */


const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_URL = "https://prosota.ao";

/* -------------------------------------------------------------------------- */
/* Viewport                                                                   */
/* -------------------------------------------------------------------------- */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#002950",
};

/* -------------------------------------------------------------------------- */
/* SEO Metadata                                                               */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "PRO SOTA | Arquitectura, Engenharia e Construção",
    template: "%s | PRO SOTA",
  },

  description:
    "A PRO SOTA é uma empresa angolana de arquitectura, engenharia, construção e fiscalização. Desenvolvemos projectos e soluções integradas.",

  applicationName: "PRO SOTA",

  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },

  keywords: [
    "PRO SOTA",
    "arquitectura em Angola",
    "empresas de construção em Angola",
    "engenharia em Luanda",
    "projectos de arquitectura",
    "fiscalização de obras",
    "construção civil em Angola",
    "consultoria de engenharia",
  ],

  authors: [{ name: "PRO SOTA" }],
  creator: "PRO SOTA",
  publisher: "PRO SOTA",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: SITE_URL,
    siteName: "PRO SOTA",
    title: "PRO SOTA | Damos forma às ideias. Construímos o futuro.",
    description:
      "Arquitectura, Engenharia, Construção e Fiscalização em Angola.",
    images: [
      {
        url: "/images/logo-vertical.png",
        width: 1200,
        height: 630,
        alt: "PRO SOTA - Arquitectura, Engenharia e Construção",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PRO SOTA | Arquitectura e Engenharia",
    description: "Damos forma às ideias. Construímos o futuro.",
    images: ["/images/logo-horizontal.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Root Layout                                                                */
/* -------------------------------------------------------------------------- */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-AO"
      className={[
        "min-h-full antialiased",
        manrope.variable,
        mono.variable,
      ].join(" ")}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-svh flex-col">
        <OrganizationSchema />

        <ToastProvider>
          {children}
        </ToastProvider>

        <Analytics />
      </body>
    </html>
  );
}