import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import {
  getCrudResourceConfig,
  type CrudResourceConfig,
  type SelectField,
} from "@/lib/admin/adminCrudConfig";
import { fetchSelectOptions, parseFormFieldValue } from "@/lib/admin/adminCrudUtils";

export default async function AdminResourceEdit({
  params,
}: {
  params: { resource: string; id: string };
}) {
  const config = getCrudResourceConfig(params.resource);
  if (!config) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">Unknown admin resource</h1>
        <div className="text-gray-600">No CRUD config for: {params.resource}</div>
      </main>
    );
  }
  const configNonNull = config;

  const { supabase } = await requireSuperadmin();

  const selectColumns = Array.from(new Set(configNonNull.defaultSelectColumns)).join(", ");

  const { data: item, error: itemError } = await supabase
    .from(configNonNull.table)
    .select(selectColumns)
    .eq(configNonNull.idColumn, params.id)
    .single();

  if (itemError || !item) return notFound();

  const selectFields = configNonNull.formFields.filter(
    (f): f is SelectField => f.kind === "select"
  );

  const optionsByFieldName = new Map<string, Awaited<ReturnType<typeof fetchSelectOptions>>>();
  for (const field of selectFields) {
    optionsByFieldName.set(field.name, await fetchSelectOptions(supabase, field));
  }

  async function updateResource(formData: FormData) {
    "use server";

    const { supabase, profile } = await requireSuperadmin();
    const payload: Record<string, unknown> = {};
    // Your schema states whitelist_email_addresses audit fields are handled by DB triggers.
    if (configNonNull.table !== "whitelist_email_addresses") {
      payload.modified_by_user_id = profile.id;
    }

    for (const field of configNonNull.formFields) {
      if (!configNonNull.updateFields.includes(field.name)) continue;
      const value = parseFormFieldValue(field, formData);
      payload[field.name] = value;
    }

    const { error } = await supabase
      .from(configNonNull.table)
      .update(payload)
      .eq(configNonNull.idColumn, params.id);

    if (error) {
      throw new Error(error.message);
    }

    redirect(`/admin/${configNonNull.resourceSlug}`);
  }

  async function deleteResource() {
    "use server";

    const { supabase } = await requireSuperadmin();
    const { error } = await supabase
      .from(configNonNull.table)
      .delete()
      .eq(configNonNull.idColumn, params.id);

    if (error) {
      throw new Error(error.message);
    }

    redirect(`/admin/${configNonNull.resourceSlug}`);
  }

  return (
    <main className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Edit {configNonNull.resourceSlug.replaceAll("-", " ")}
        </h1>
        <Link href={`/admin/${configNonNull.resourceSlug}`} className="underline">
          Back
        </Link>
      </div>

      <form action={updateResource} className="space-y-4">
        <div className="rounded-xl border p-4 bg-gray-50 text-xs text-gray-600">
          Editing ID: <span className="font-mono">{params.id}</span>
        </div>

        {configNonNull.formFields.map((field) => {
          const value = (item as unknown as Record<string, unknown>)[field.name];

          if (field.kind === "text") {
            return (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  defaultValue={(value as string | null) ?? ""}
                  required={field.required}
                  className="w-full rounded border p-2"
                />
              </div>
            );
          }

          if (field.kind === "textarea") {
            return (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label}</label>
                <textarea
                  name={field.name}
                  defaultValue={(value as string | null) ?? ""}
                  required={field.required}
                  rows={field.rows ?? 4}
                  className="w-full rounded border p-2"
                />
              </div>
            );
          }

          if (field.kind === "number") {
            const numericValue =
              typeof value === "number" ? value : value == null ? "" : String(value);
            return (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  defaultValue={numericValue}
                  required={field.required}
                  step={field.step}
                  min={field.min}
                  className="w-full rounded border p-2"
                />
              </div>
            );
          }

          if (field.kind === "boolean") {
            return (
              <div key={field.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={value === true}
                />
                <label className="font-medium">{field.label}</label>
              </div>
            );
          }

          const selectField = field;
          const options = optionsByFieldName.get(selectField.name) ?? [];
          const allowNull = selectField.nullOnEmpty ?? false;
          const selectValue = value == null ? "" : String(value);

          return (
            <div key={field.name}>
              <label className="block mb-1 font-medium">{field.label}</label>
              <select
                name={field.name}
                required={!!selectField.required && !allowNull}
                defaultValue={selectValue}
                className="w-full rounded border p-2"
              >
                {allowNull && <option value="">None</option>}
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div className="flex gap-3">
          <button className="rounded bg-black px-4 py-2 text-white">
            Save Changes
          </button>
          <Link
            href={`/admin/${configNonNull.resourceSlug}/${params.id}`}
            className="rounded border px-4 py-2"
          >
            Refresh
          </Link>
        </div>
      </form>

      <form action={deleteResource} className="mt-6">
        <button className="rounded bg-red-600 px-4 py-2 text-white">
          Delete
        </button>
      </form>
    </main>
  );
}

