
import { getPublishedPortfolioProjects } from "@/services/portfolio";
import HomeClient from "./(client_pages)/home_page";

type DisplayProject = {
  id: string;
  name: string;
  category: string;
  categories: string[];
  year: string;
  location: string;
  summary: string;
  description: string;
  images: string[];
  featured: boolean;
};

function parseCategories(category: string): string[] {
  return [
    ...new Set(
      category
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export default async function HomePage() {
  const projects = await getPublishedPortfolioProjects();

  const displayProjects: DisplayProject[] = projects
    .filter(Boolean)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return a.is_featured ? -1 : 1;
      }

      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((project) => {
      const category = [
        project.project_type,
        project.speciality,
      ]
        .filter(Boolean)
        .join(", ");

      const images = [
        project.cover_image_path,
        ...(project.gallery_image_paths ?? []),
      ].filter(
        (image): image is string =>
          typeof image === "string" && Boolean(image.trim()),
      );

      return {
        id: project.slug || project.id,
        name: project.title ?? "",
        category,
        categories: parseCategories(category),
        year: project.completion_date
          ? project.completion_date.slice(0, 4)
          : "",
        location: project.location ?? "",
        summary: project.summary ?? project.description ?? "",
        description: project.description ?? project.summary ?? "",
        images: [...new Set(images)],
        featured: project.is_featured ?? false,
      };
    });

  console.log("displayProjects", displayProjects);

  return (
    <main>
      <HomeClient projects={displayProjects} />
    </main>
  );
}
