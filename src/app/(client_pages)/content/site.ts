// Single source of truth for company facts. Fill the TODOs with real data;
// anything left undefined is simply omitted from the page and the JSON-LD.
export const site = {
  name: "PRO SOTA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.prosota.ao", // TODO real domain
  founded: 1997,
  logo: "/images/logo-vertical.png", // TODO must exist in /public
  email: undefined as string | undefined, // TODO
  phone: undefined as string | undefined, // TODO e.g. "+244 9XX XXX XXX"
  whatsapp: undefined as string | undefined, // TODO digits only, e.g. "2449XXXXXXXX"
  address: {
    locality: undefined as string | undefined, // TODO e.g. "Luanda"
    street: undefined as string | undefined,
    country: "AO",
  },
  sameAs: [] as string[], // TODO social profile URLs
};