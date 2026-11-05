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
  title: {
    default: "PRO SOTA | Arquitectura, Engenharia e Construção",
    template: "%s | PRO SOTA",
  },
  description:
    "PRO SOTA é uma empresa de Arquitectura, Engenharia e Construção em Angola. Oferecemos serviços de design, construção e gestão de projectos.",
  icons: {
    icon: "/images/logo-vertical.png",
    apple: "/images/logo-vertical.png",
  },
  openGraph: {
    title: "PRO SOTA",
    description: "Arquitectura, Engenharia e Construção em Angola.",
    images: ["/images/logo-vertical.png"],
  },
  twitter: {
    card: "summary",
    images: ["/images/logo-vertical.png"],
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
