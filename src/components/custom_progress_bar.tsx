interface Props {
  value: number;
}

export default function ProgressBar({ value }: Props) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 mr-8">
      <div
        className="h-full rounded-full bg-slate-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}