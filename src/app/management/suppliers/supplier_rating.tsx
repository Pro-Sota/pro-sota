"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Loader2,
  Star,
} from "lucide-react";

import { updateSupplierRating } from "@/services/supplier_client";

export default function SupplierRating({
  supplierId,
  initialRating,
}: {
  supplierId: string;
  initialRating: number | null;
}) {
  const [rating, setRating] = useState(
    initialRating ?? 0
  );
  const [savedRating, setSavedRating] = useState(
    initialRating ?? 0
  );
  const [isPending, startTransition] =
    useTransition();

  function handleSave() {
    if (rating < 1 || rating > 5) return;

    startTransition(async () => {
      try {
        await updateSupplierRatingAction(
          supplierId,
          rating
        );

        setSavedRating(rating);
      } catch (error) {
        console.error(
          "Update supplier rating error:",
          error
        );
      }
    });
  }

  const hasChanges = rating !== savedRating;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Avaliação
        </h2>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold text-slate-900">
                {rating > 0
                  ? rating.toFixed(1)
                  : "—"}
              </span>

              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map(
                    (_, index) => {
                      const value = index + 1;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setRating(value)
                          }
                          disabled={isPending}
                          aria-label={`${value} estrelas`}
                          className="rounded p-0.5 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Star
                            size={19}
                            className={
                              value <= rating
                                ? "fill-[#BD9655] text-[#BD9655]"
                                : "text-slate-200"
                            }
                          />
                        </button>
                      );
                    }
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {rating > 0
                    ? "Avaliação actual do fornecedor"
                    : "Seleccione uma avaliação"}
                </p>
              </div>
            </div>
          </div>

          {hasChanges && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || rating === 0}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#002950] px-3.5 text-sm font-medium text-white transition hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Check size={15} />
              )}

              {isPending
                ? "A guardar..."
                : "Guardar avaliação"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}



export async function updateSupplierRatingAction(
  supplierId: string,
  rating: number | null
) {
  if (!supplierId) {
    throw new Error("O ID do fornecedor é obrigatório.");
  }

  return updateSupplierRating(supplierId, rating);
}