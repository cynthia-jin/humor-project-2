import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import {
  getCrudResourceConfig,
  getAllCrudResourceSlugs,
  type CrudResourceConfig,
} from "@/lib/admin/adminCrudConfig";

function formatBoolean(value: unknown) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return value == null ? "-" : String(value);
}

export default async function AdminResourceList({
  params,
}: {
  params: { resource: string };
}) {
  const config: CrudResourceConfig | null = getCrudResourceConfig(params.resource);
  if (!config) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">Unknown admin resource</h1>
        <div className="text-gray-600">
          No CRUD config for: <span className="font-mono">{params.resource}</span>
        </div>
        <div className="mt-2 text-gray-600 text-sm">
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
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold capitalize">{config.resourceSlug.replaceAll("-", " ")}</h1>
        <Link
          href={`/admin/${config.resourceSlug}/new`}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          New
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {config.listFields.map((f) => (
                <th key={f.name} className="p-3 text-left">
                  {f.label}
                </th>
              ))}
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr
                key={String((row as unknown as Record<string, unknown>)[config.idColumn])}
                className="border-b align-top"
              >
                {config.listFields.map((f) => {
                  const raw = (row as unknown as Record<string, unknown>)[f.name];
                  return (
                    <td key={f.name} className="p-3">
                      {typeof raw === "boolean" ? formatBoolean(raw) : raw == null ? "-" : String(raw)}
                    </td>
                  );
                })}
                <td className="p-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/${config.resourceSlug}/${String(
                        (row as unknown as Record<string, unknown>)[config.idColumn]
                      )}`}
                      className="underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

