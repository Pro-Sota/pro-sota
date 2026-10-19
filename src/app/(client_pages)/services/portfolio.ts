import defaults from "../components/portfolioData";

export default async function getProjects() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/projects`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("API indisponível");
    }

    return await response.json();
  } catch {
    return defaults;
  }
}