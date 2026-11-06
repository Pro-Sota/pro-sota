
"use server";

import { revalidatePath } from "next/cache";

import {
  createPortfolioProject,
  uploadPortfolioImage,
  deletePortfolioImage,
  type PortfolioProjectInput,
} from "@/services/portfolio";

export async function uploadPortfolioImageAction(formData: FormData) {
  try {
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      throw new Error("Seleccione uma imagem válida.");
    }

    const result = await uploadPortfolioImage(
      file,
      typeof folder === "string" ? folder : "projects",
    );

    return {
      success: true as const,
      data: result,
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a imagem.",
    };
  }
}

export async function deletePortfolioImageAction(path: string) {
  try {
    await deletePortfolioImage(path);

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível remover a imagem.",
    };
  }
}

export async function createPortfolioProjectAction(
  input: PortfolioProjectInput,
) {
  try {
    if (!input.title?.trim()) {
      throw new Error("O nome do projecto é obrigatório.");
    }

    if (!input.slug?.trim()) {
      throw new Error("O endereço do projecto é obrigatório.");
    }

    if (!input.project_type?.trim()) {
      throw new Error("Seleccione uma categoria.");
    }

    if (!input.services?.length) {
      throw new Error("Seleccione pelo menos uma especialidade.");
    }

    if (!["draft", "published", "archived"].includes(input.status)) {
      throw new Error("Estado de publicação inválido.");
    }

    if (input.gallery_image_paths.length > 20) {
      throw new Error("O limite é de 20 imagens por projecto.");
    }

    const slug = input.slug
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      throw new Error("O endereço do projecto é inválido.");
    }

    const result = await createPortfolioProject({
      ...input,
      slug,
    });

    revalidatePath("/management/portfolio");
    revalidatePath("/portfolio");
    revalidatePath(`/portfolio/${slug}`);

    return {
      success: true as const,
      data: result,
    };
  } catch (error) {
    console.error("createPortfolioProjectAction:", error);

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o projecto.",
    };
  }
}
