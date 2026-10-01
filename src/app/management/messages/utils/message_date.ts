export function getDateKey(
  timestamp: string,
) {
  const date = new Date(timestamp);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatMessageDate(
  timestamp: string,
) {
  const date = new Date(timestamp);
  const now = new Date();

  const todayKey = getDateKey(
    now.toISOString(),
  );

  const yesterday = new Date(now);

  yesterday.setDate(
    yesterday.getDate() - 1,
  );

  const yesterdayKey = getDateKey(
    yesterday.toISOString(),
  );

  const messageDateKey =
    getDateKey(timestamp);

  if (messageDateKey === todayKey) {
    return "Hoje";
  }

  if (
    messageDateKey === yesterdayKey
  ) {
    return "Ontem";
  }

  return date.toLocaleDateString(
    "pt-AO",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}