export function formatTimestamp(value: unknown): string {
  if (value == null || value === "") return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function rawTimestamp(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value);
}

export function truncateId(value: unknown, head = 6, tail = 4): string {
  if (value == null || value === "") return "-";
  const s = String(value);
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
