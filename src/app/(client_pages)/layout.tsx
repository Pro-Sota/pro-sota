import type { ReactNode } from "react";
import { Roboto_Condensed } from "next/font/google";

import Footer from "./components/footer";
import Nav from "./components/nav";

import localFont from "next/font/local";

const bigShoulders = localFont({
  src: "../../../public/fonts/BigShoulders-VariableFont_opsz,wght.ttf",
  variable: "--font-big-shoulders",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
});

const roboto = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: false,
});

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "public-ui flex min-h-svh flex-col",
        bigShoulders.variable,
        roboto.variable,
      ].join(" ")}
    >
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}