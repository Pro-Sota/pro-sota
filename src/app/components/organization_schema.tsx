export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",

    name: "PRO SOTA",

    url: "https://prosota.ao",

    logo: "https://prosota.ao/images/logo-brand.png",

    image: "https://prosota.ao/images/logo-vertical.png",

    description:
      "Empresa angolana especializada em arquitectura, engenharia, construção, fiscalização e consultoria.",

    foundingDate: "1997",

    address: {
      "@type": "PostalAddress",
      streetAddress: "Lar do Patriota",
      addressLocality: "Luanda",
      addressCountry: "AO",
    },

    areaServed: {
      "@type": "Country",
      name: "Angola",
    },

    knowsAbout: [
      "Arquitectura",
      "Engenharia",
      "Construção Civil",
      "Fiscalização de Obras",
      "Consultoria",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}