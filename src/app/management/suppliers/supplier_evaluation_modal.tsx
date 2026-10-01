"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  Loader2,
  Star,
  X,
} from "lucide-react";

import {
  createSupplierEvaluationAction,
} from "@/actions/suppliers";

type Props = {
  supplierId: string;
};

type CriteriaKey =
  | "quality"
  | "delivery"
  | "price"
  | "communication"
  | "reliability";

const criteria: {
  key: CriteriaKey;
  label: string;
}[] = [
  {
    key: "quality",
    label: "Qualidade",
  },
  {
    key: "delivery",
    label: "Prazo de entrega",
  },
  {
    key: "price",
    label: "Preço",
  },
  {
    key: "communication",
    label: "Comunicação",
  },
  {
    key: "reliability",
    label: "Fiabilidade",
  },
];

export function SupplierEvaluationModal({
  supplierId,
}: Props) {
  const [open, setOpen] = useState(false);

  const [ratings, setRatings] = useState<
    Record<CriteriaKey, number>
  >({
    quality: 0,
    delivery: 0,
    price: 0,
    communication: 0,
    reliability: 0,
  });

  const [comment, setComment] = useState("");

  const [isPending, startTransition] =
    useTransition();

  function setRating(
    criterion: CriteriaKey,
    value: number
  ) {
    setRatings((current) => ({
      ...current,
      [criterion]: value,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      Object.values(ratings).some(
        (value) => value < 1
      )
    ) {
      return;
    }

    startTransition(async () => {
      await createSupplierEvaluationAction(
        supplierId,
        {
          ...ratings,
          comment: comment.trim() || null,
        }
      );

      setOpen(false);

      setRatings({
        quality: 0,
        delivery: 0,
        price: 0,
        communication: 0,
        reliability: 0,
      });

      setComment("");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[#002950] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#003b70]"
      >
        Avaliar fornecedor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="font-semibold text-[#002950]">
                  Avaliar fornecedor
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Avalie o desempenho deste fornecedor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              <div className="space-y-4">
                {criteria.map((criterion) => (
                  <RatingField
                    key={criterion.key}
                    label={criterion.label}
                    value={ratings[criterion.key]}
                    onChange={(value) =>
                      setRating(
                        criterion.key,
                        value
                      )
                    }
                  />
                ))}
              </div>

              <div>
                <label
                  htmlFor="supplier-evaluation-comment"
                  className="mb-2 block text-sm font-medium text-[#002950]"
                >
                  Comentário
                </label>

                <textarea
                  id="supplier-evaluation-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  rows={4}
                  placeholder="Adicione uma observação sobre o desempenho..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#BD9655]"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    Object.values(ratings).some(
                      (value) => value < 1
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Guardar avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="rounded p-1"
            aria-label={`${star} de 5`}
          >
            <Star
              className={`h-5 w-5 transition ${
                star <= value
                  ? "fill-[#BD9655] text-[#BD9655]"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}