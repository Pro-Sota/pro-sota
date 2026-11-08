import type { Metadata } from "next";

import Nav from "../components/nav";
import Contact from "../components/contact_page";
import Footer from "../components/footer";

import "../../globals.css";
import "../../styles.css";
import "../../admin.css";

export const metadata: Metadata = {
  title: "Contactos | PRO SOTA",
  description:
    "Entre em contacto com a PRO SOTA. Estamos disponíveis para apoiar o seu projecto de arquitectura, engenharia, construção ou fiscalização em Angola.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contactos | PRO SOTA",
    description:
      "Fale com a nossa equipa e descubra como podemos transformar as suas ideias em projectos concretos.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />

      <main>
        {/* CONTACT HERO */}
        <section
          id="top"
          className="relative overflow-hidden bg-[#002950] px-6 pb-20 pt-32 text-[#F7F7F5] md:px-12 md:pb-28 md:pt-40 lg:px-20"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 flex items-center gap-3">
              <span className="h-px w-10 bg-[#BD9655]" />

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Estamos disponíveis
              </span>
            </div>

            <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-end">
              <h1 className="max-w-[850px] text-6xl font-semibold leading-[0.92] tracking-[-0.055em] md:text-8xl">
                Vamos falar
                <br />
                sobre o seu{" "}
                <span className="text-[#BD9655]">projecto.</span>
              </h1>

              <p className="max-w-[380px] text-sm leading-7 text-white/65 md:justify-self-end">
                Cada grande projecto começa com uma conversa.
                Partilhe connosco a sua ideia e descubra como
                podemos ajudar a concretizá-la.
              </p>
            </div>

            <div className="mt-16 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/15 pt-6 text-xs uppercase tracking-[0.16em] text-white/55">
              <span>Arquitectura</span>
              <span>Engenharia</span>
              <span>Construção</span>
              <span>Fiscalização</span>
            </div>
          </div>
        </section>

        {/* CONTACT FORM AND INFORMATION */}
        <section
          id="contacto"
          className="scroll-mt-24 bg-[#F7F7F5]"
        >
          <Contact />
        </section>
      </main>

      <Footer />
    </>
  );
}