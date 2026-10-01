type Props = {
  title: string;
  action?: React.ReactNode;
};

export function SectionTitle({
  title,
  action,
}: Props) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-sm font-semibold text-[#002950]">
        {title}
      </h2>

      {action}
    </div>
  );
}