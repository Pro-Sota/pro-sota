"use client";

import type { MessageView } from "@/services/messages";

interface Props {
  message: MessageView;
}

export default function MessageBubble({
  message,
}: Props) {
  return (
    <div
      className={`flex ${
        message.isOwn
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={[
          "max-w-xs rounded-lg px-4 py-2",
          "lg:max-w-md xl:max-w-lg",
          message.isOwn
            ? "rounded-br-none bg-[#002950] text-white"
            : "rounded-bl-none bg-[#F1F5F9] text-slate-900",
        ].join(" ")}
      >
        {!message.isOwn && (
          <p className="mb-1 text-xs font-semibold opacity-75">
            {message.senderName}
          </p>
        )}

        <p className="break-words text-sm">
          {message.content}
        </p>

        <p
          className={[
            "mt-1 text-xs",
            message.isOwn
              ? "text-slate-300"
              : "text-slate-600",
          ].join(" ")}
        >
          {formatMessageTime(
            message.timestamp,
          )}
        </p>
      </div>
    </div>
  );
}

function formatMessageTime(
  timestamp: string,
) {
  return new Date(
    timestamp,
  ).toLocaleTimeString("pt-AO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}