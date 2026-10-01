interface Props {
  message: string;
}

export default function ChatEmptyState({
  message,
}: Props) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}