"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const base =
    "rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950";
  const color =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 focus-visible:ring-red-400"
      : "bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-400";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${base} ${color}`}
      aria-busy={pending}
    >
      {pending ? pendingLabel ?? "Saving…" : label}
    </button>
  );
}
