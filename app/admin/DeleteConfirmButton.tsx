"use client";

export default function DeleteConfirmButton({
  label = "Delete",
  message = "Delete this row? This cannot be undone.",
}: {
  label?: string;
  message?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }}
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
    >
      {label}
    </button>
  );
}
