import ServicesOverview from "./client_page";
import "../../admin.css";
import "../../styles.css";


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serviços de Arquitectura, Engenharia, Construção e Fiscalização",
  description:
    "Descubra os serviços da PRO SOTA: arquitectura, engenharia, construção de obras públicas e privadas, fiscalização e consultoria em Angola.",
  alternates: {
    canonical: "/services",
  },
};



export default function ServicesPage() {
  return <ServicesOverview />;
}