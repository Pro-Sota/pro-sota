import type { Metadata } from "next";
import Contact from "../components/contact_page";

export const metadata: Metadata = {
    title: "Contactos | PRO SOTA",
    description:
        "Entre em contacto com a PRO SOTA para discutir o seu projecto de arquitectura, engenharia, construção ou fiscalização em Angola.",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contactos | PRO SOTA",
        description:
            "Fale com a equipa PRO SOTA sobre o seu próximo projecto.",
        url: "/contact",
        type: "website",
    },
};

export default function ContactPage() {
    return <Contact />;
}