"use client";

import { FormEvent, useMemo, useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";

import type {
  Resource,
  ResourceMovement,
  UnitOfMeasure,
} from "@/app/management/work-resources/work_resource";

type MovementType = ResourceMovement["movement_type"];

type Props = {
  open: boolean;
  resource: Resource | null;
  onClose: () => void;
  onSubmit?: (data: {
    resource_id: string;
    movement_type: MovementType;
    quantity: number | null;
    origin: string | null;
    destination: string | null;
    expected_return_date: string | null;
    notes: string | null;
  }) => Promise<void> | void;
};

const MOVEMENT_TYPES: MovementType[] = [
  "Entrada",
  "Saída",
  "Transferência",
  "Devolução",
  "Consumo",
  "Manutenção",
  "Baixa",
];

export default function ResourceMovementModal({
  open,
  resource,
  onClose,
  onSubmit,
}: Props) {
  const [movementType, setMovementType] =
    useState<MovementType>("Saída");

  const [quantity, setQuantity] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] =
    useState("");

  const [expectedReturnDate, setExpectedReturnDate] =
    useState("");

  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const consumable =
    resource?.resource_type ===
    "Material consumível";

  const quantityLabel = useMemo(() => {
    if (movementType === "Consumo") {
      return "Quantidade consumida";
    }

    if (movementType === "Entrada") {
      return "Quantidade recebida";
    }

    if (movementType === "Devolução") {
      return "Quantidade devolvida";
    }

    if (movementType === "Baixa") {
      return "Quantidade abatida";
    }

    return "Quantidade";
  }, [movementType]);

  if (!open || !resource) {
    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (
      consumable &&
      quantity &&
      Number(quantity) <= 0
    ) {
      setError(
        "A quantidade deve ser superior a zero.",
      );

      return;
    }

    try {
      setSaving(true);

      await onSubmit?.({
        resource_id: resource!.resource_id,
        movement_type: movementType,
        quantity:
          quantity === ""
            ? null
            : Number(quantity),
        origin: origin.trim() || null,
        destination:
          destination.trim() || null,
        expected_return_date:
          expectedReturnDate || null,
        notes: notes.trim() || null,
      });

      setQuantity("");
      setOrigin("");
      setDestination("");
      setExpectedReturnDate("");
      setNotes("");

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registar a movimentação.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#002950]">
                <ArrowRightLeft size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Registar movimentação
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {resource.name} · {resource.code}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tipo de movimentação
              </label>

              <select
                value={movementType}
                onChange={(event) =>
                  setMovementType(
                    event.target.value as MovementType,
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
              >
                {MOVEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {quantityLabel}
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    placeholder={
                      consumable
                        ? "0"
                        : "Opcional"
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-20 text-sm text-slate-900 outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
                  />

                  {resource.unit_of_measure && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      {resource.unit_of_measure}
                    </span>
                  )}
                </div>

                {!consumable && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Para equipamentos e ferramentas,
                    pode deixar vazio.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Data prevista de devolução
                </label>

                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(event) =>
                    setExpectedReturnDate(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Origem
                </label>

                <input
                  value={origin}
                  onChange={(event) =>
                    setOrigin(event.target.value)
                  }
                  placeholder="Ex.: Armazém Central"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Destino
                </label>

                <input
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: Obra Talatona"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Observações
              </label>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={3}
                placeholder="Informação adicional sobre a movimentação..."
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#002950] focus:ring-1 focus:ring-[#002950]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] hover:bg-[#BD9655]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "A registar..."
                : "Registar movimentação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}