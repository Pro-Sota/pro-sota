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

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });


const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://www.prosota.ao"),

  title: {
    default: "PRO SOTA | Arquitectura, Engenharia e Construção",
    template: "%s | PRO SOTA",
  },

  description:
    "A PRO SOTA é uma empresa angolana de arquitectura, engenharia, construção e fiscalização, com experiência desde 1997.",

  openGraph: {
    type: "website",
    locale: "pt_AO",
    siteName: "PRO SOTA",
    title: "PRO SOTA | Damos forma às ideias. Construímos o futuro.",
    description:
      "Arquitectura, Engenharia, Construção e Fiscalização em Angola.",
    url: "https://www.prosota.ao",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PRO SOTA — Arquitectura, Engenharia e Construção",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PRO SOTA",
    description:
      "Damos forma às ideias. Construímos o futuro.",
    images: ["/images/og-image.jpg"],
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
