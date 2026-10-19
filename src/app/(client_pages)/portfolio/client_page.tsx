
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "../components/nav";
import Footer from "../components/footer";
import PortfolioGrid from "../components/portfolio_grid";
import Lightbox from "../components/light_box";
import Contact from "../components/contact";

import "../../admin.css";
import "../../styles.css";


const CATEGORIES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização",
] as const;

type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  year: string;
  location: string;
  summary: string;
  description: string;
  images: string[];
};

type PortfolioClientProps = {
  projects: PortfolioProject[];
  projectId?: string;
};

export default function PortfolioClient({
  projects,
  projectId,
}: PortfolioClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const list = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((project) => project.category === filter),
    [filter, projects]
  );

  const openProject =
    projects.find((project) => project.id === projectId) ?? null;

  function openGallery(id: string) {
    router.push(`/portfolio/${encodeURIComponent(id)}`);
  }

  function closeGallery() {
    router.push("/portfolio", { scroll: false });
  }

  return (
    <>
      <Nav dark />

      <main>
        <section className="subhero">
          <div className="subhero__grid" />

          <div className="wrap">
            <h1>Portefólio completo</h1>

            <p>
              Uma selecção de projectos de arquitectura, engenharia,
              construção e fiscalização, entre Angola, Portugal e Espanha.
              Seleccione uma imagem para ver a galeria completa de cada
              projecto.
            </p>

            <div className="filter-row" aria-label="Filtrar por categoria">
              <button
                type="button"
                className={`filter-btn${filter === "all" ? " is-active" : ""}`}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                Todos
              </button>

              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-btn${
                    filter === category ? " is-active" : ""
                  }`}
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          className="portfolio"
          style={{ paddingTop: "clamp(40px, 6vh, 60px)" }}
        >
          <div className="wrap">
            {list.length > 0 ? (
              <PortfolioGrid
                projects={list}
                onOpen={openGallery}
              />
            ) : (
              <div className="pf-empty">
                Ainda não existem projectos nesta categoria.
              </div>
            )}
          </div>
        </section>

        <Contact />
      </main>

      <Footer />

      <Lightbox
        project={openProject}
        onClose={closeGallery}
      />
    </>
  );
}
