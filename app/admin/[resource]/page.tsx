import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import {
  getCrudResourceConfig,
  getAllCrudResourceSlugs,
  type CrudResourceConfig,
} from "@/lib/admin/adminCrudConfig";
import { formatTimestamp, truncateId } from "@/lib/admin/format";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMESTAMP_KEYS = new Set([
  "created_datetime_utc",
  "modified_datetime_utc",
]);

function formatCell(name: string, raw: unknown) {
  if (typeof raw === "boolean") {
    return raw ? "Yes" : "No";
  }
  if (raw == null) return "-";
  if (TIMESTAMP_KEYS.has(name)) return formatTimestamp(raw);
  if (typeof raw === "string" && UUID_REGEX.test(raw)) {
    return (
      <span className="font-mono text-xs text-gray-400" title={raw}>
        {truncateId(raw)}
      </span>
    );
  }
  return String(raw);
}

const RIGHT_ALIGN_KEYS = new Set([
  "id",
  "priority",
  "caption_count",
  "order_by",
]);

export default async function AdminResourceList({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const config: CrudResourceConfig | null = getCrudResourceConfig(resource);
  if (!config) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">Unknown admin resource</h1>
        <div className="text-gray-300">
          No CRUD config for:{" "}
          <span className="font-mono">{String(resource)}</span>
          <div className="mt-1 text-xs text-gray-400">
            typeof resource: <span className="font-mono">{typeof resource}</span>
          </div>
        </div>
        <div className="mt-2 text-gray-400 text-sm">
          Known CRUD resources: <span className="font-mono">{getAllCrudResourceSlugs().join(", ")}</span>
        </div>
      </main>
    );
  }

  const { supabase } = await requireSuperadmin();

  const selectColumns = Array.from(
    new Set([...config.defaultSelectColumns])
  ).join(", ");

  const { data, error } = await supabase
    .from(config.table)
    .select(selectColumns)
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold capitalize">{config.resourceSlug.replaceAll("-", " ")}</h1>
        <Link
          href={`/admin/${config.resourceSlug}/new`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          New
        </Link>
      </div>
      <div className="text-sm text-gray-400 mb-4">
        Showing {(data ?? []).length} rows
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/20">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-900/60 sticky top-0">
            <tr className="text-gray-300">
              {config.listFields.map((f) => (
                <th
                  key={f.name}
                  className={`p-3 font-medium ${
                    RIGHT_ALIGN_KEYS.has(f.name) ? "text-right" : "text-left"
                  }`}
                >
                  {f.label}
                </th>
              ))}
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row, idx) => {
              const idValue = String(
                (row as unknown as Record<string, unknown>)[config.idColumn]
              );
              return (
                <tr
                  key={idValue}
                  className={`border-b border-gray-800 align-top text-gray-200 ${
                    idx % 2 === 1 ? "bg-gray-900/10" : ""
                  }`}
                >
                  {config.listFields.map((f) => {
                    const raw = (row as unknown as Record<string, unknown>)[f.name];
                    return (
                      <td
                        key={f.name}
                        className={`p-3 ${
                          RIGHT_ALIGN_KEYS.has(f.name)
                            ? "text-right tabular-nums"
                            : ""
                        }`}
                      >
                        {formatCell(f.name, raw)}
                      </td>
                    );
                  })}
                  <td className="p-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/${config.resourceSlug}/${idValue}`}
                        className="underline text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(data ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={config.listFields.length + 1}
                  className="p-4 text-sm text-gray-400"
                >
                  No rows yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

