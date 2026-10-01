import {
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
  WalletCards,
} from "lucide-react";

import type { SupplierEvaluation } from "./types";
import { SectionTitle } from "./section_title";
import { SupplierEvaluationModal } from "./supplier_evaluation_modal";

type Props = {
  supplierId: string;
  evaluations: SupplierEvaluation[];
};

const criteria = [
  {
    key: "quality",
    label: "Qualidade",
    icon: PackageCheck,
  },
  {
    key: "delivery",
    label: "Prazo",
    icon: Truck,
  },
  {
    key: "price",
    label: "Preço",
    icon: WalletCards,
  },
  {
    key: "communication",
    label: "Comunicação",
    icon: MessageCircle,
  },
  {
    key: "reliability",
    label: "Fiabilidade",
    icon: ShieldCheck,
  },
] as const;

export function SupplierPerformance({
  supplierId,
  evaluations,
}: Props) {
  const averages = getAverages(evaluations);
  const overall = getOverall(averages);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <SectionTitle
        title="Desempenho"
        action={
          <SupplierEvaluationModal
            supplierId={supplierId}
          />
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#BD9655]/10">
          <Star className="h-5 w-5 fill-[#BD9655] text-[#BD9655]" />
        </div>

        <div>
          <div className="text-lg font-semibold text-[#002950]">
            {overall != null
              ? `${overall.toFixed(1)} / 5`
              : "Sem avaliação"}
          </div>

          <p className="text-xs text-slate-400">
            {evaluations.length === 1
              ? "1 avaliação"
              : `${evaluations.length} avaliações`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion) => {
          const value = averages[criterion.key];

          return (
            <PerformanceRow
              key={criterion.key}
              label={criterion.label}
              value={value}
              Icon={criterion.icon}
            />
          );
        })}
      </div>
    </section>
  );
}

function PerformanceRow({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number | null;
  Icon: typeof PackageCheck;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />

      <span className="w-28 text-sm text-slate-600">
        {label}
      </span>

      <div className="flex flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#BD9655]"
            style={{
              width: value
                ? `${(value / 5) * 100}%`
                : "0%",
            }}
          />
        </div>

        <span className="w-8 text-right text-sm font-medium text-[#002950]">
          {value != null
            ? value.toFixed(1)
            : "—"}
        </span>
      </div>
    </div>
  );
}

function getAverages(
  evaluations: SupplierEvaluation[]
) {
  if (!evaluations.length) {
    return {
      quality: null,
      delivery: null,
      price: null,
      communication: null,
      reliability: null,
    };
  }

  return {
    quality: average(evaluations.map((item) => item.quality)),
    delivery: average(evaluations.map((item) => item.delivery)),
    price: average(evaluations.map((item) => item.price)),
    communication: average(
      evaluations.map((item) => item.communication)
    ),
    reliability: average(
      evaluations.map((item) => item.reliability)
    ),
  };
}

function average(values: number[]) {
  if (!values.length) return null;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function getOverall(
  averages: ReturnType<typeof getAverages>
) {
  const values = Object.values(averages).filter(
    (value): value is number => value != null
  );

  if (!values.length) return null;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}