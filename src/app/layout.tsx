import type { Metadata } from "next";
import {
  Roboto,
  Roboto_Mono,
  Inter,
} from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils/utils";
import { ToastProvider } from "./components/toast/toast_provider";
import "./admin.css";
import "./styles.css";

import OrganizationSchema from "./components/organization_schema";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });


const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});


const SITE_URL = "https://prosota.ao";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "PRO SOTA | Arquitectura, Engenharia e Construção em Angola",
    template: "%s | PRO SOTA",
  },

  description:
    "A PRO SOTA é uma empresa angolana de arquitectura, engenharia, construção e fiscalização. Desenvolvemos projectos e soluções integradas desde 1997.",

  applicationName: "PRO SOTA",

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
      "Arquitectura, Engenharia, Construção e Fiscalização em Angola. Desde 1997.",
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
    description:
      "Damos forma às ideias. Construímos o futuro. Angola · Desde 1997.",
    images: ["/images/og-image.jpg"],
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      title="Pro-Sota"
      className={cn(
        "h-full",
        "antialiased",
        roboto.variable,
        robotoMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col overflow-hidden">
<OrganizationSchema />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
