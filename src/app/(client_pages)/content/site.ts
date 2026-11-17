// Single source of truth for company facts. Fill the TODOs with real data;
// anything left undefined is simply omitted from the page and the JSON-LD.
export const site = {
  name: "PRO SOTA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosota.ao",
  founded: 2013,
  logo: "/images/logo-vertical.png", 
  email: "geral@prosota.ao",
  phone: "+244 947 803 610", 
  whatsapp: "947 804 186" , 
  address: {
    locality: "Lar do Patriota, Luanda",
    street: "Rua Mario Pinto de Andrade, nº36",
    country: "AO",
  },
  sameAs: [] as string[], // TODO social profile URLs
};