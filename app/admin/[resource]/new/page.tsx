import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import {
  getCrudResourceConfig,
  type CrudResourceConfig,
  type SelectField,
} from "@/lib/admin/adminCrudConfig";
import { fetchSelectOptions, parseFormFieldValue } from "@/lib/admin/adminCrudUtils";

export default async function AdminResourceNew({
  params,
}: {
  params: { resource: string };
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
  const configNonNull: CrudResourceConfig = config;

  const { supabase } = await requireSuperadmin();

  const selectFields = configNonNull.formFields.filter(
    (f): f is SelectField => f.kind === "select"
  );

  const optionsByFieldName = new Map<string, Awaited<ReturnType<typeof fetchSelectOptions>>>();
  for (const field of selectFields) {
    optionsByFieldName.set(field.name, await fetchSelectOptions(supabase, field));
  }

  async function createResource(formData: FormData) {
    "use server";

    const { supabase, profile } = await requireSuperadmin();
    const payload: Record<string, unknown> = {};
    // Your schema states whitelist_email_addresses audit fields are handled by DB triggers.
    if (configNonNull.table !== "whitelist_email_addresses") {
      payload.created_by_user_id = profile.id;
      payload.modified_by_user_id = profile.id;
    }

    for (const field of configNonNull.formFields) {
      const value = parseFormFieldValue(field, formData);

      if (field.required) {
        if (field.kind === "number" && value == null) {
          throw new Error(`${field.label} is required.`);
        }
        if (
          (field.kind === "text" || field.kind === "textarea") &&
          typeof value === "string" &&
          value.trim() === ""
        ) {
          throw new Error(`${field.label} is required.`);
        }
        if (field.kind === "select" && value == null) {
          throw new Error(`${field.label} is required.`);
        }
      }

      payload[field.name] = value;
    }

    const { error } = await supabase
      .from(configNonNull.table)
      .insert(payload);
    if (error) {
      throw new Error(error.message);
    }

    redirect(`/admin/${configNonNull.resourceSlug}`);
  }

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        New {configNonNull.resourceSlug.replaceAll("-", " ")}
      </h1>

      <form action={createResource} className="space-y-4">
        {configNonNull.formFields.map((field) => {
          if (field.kind === "text") {
            return (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
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
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows ?? 4}
                  className="w-full rounded border p-2"
                />
              </div>
            );
          }

          if (field.kind === "number") {
            return (
              <div key={field.name}>
                <label className="block mb-1 font-medium">{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  placeholder={field.placeholder}
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
                <input type="checkbox" name={field.name} />
                <label className="font-medium">{field.label}</label>
              </div>
            );
          }

          const selectField = field;
          const options = optionsByFieldName.get(selectField.name) ?? [];
          const allowNull = selectField.nullOnEmpty ?? false;
          const required = !!selectField.required && !allowNull;

          return (
            <div key={field.name}>
              <label className="block mb-1 font-medium">{field.label}</label>
              <select
                name={field.name}
                required={required}
                defaultValue=""
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
            Create
          </button>
          <Link
            href={`/admin/${configNonNull.resourceSlug}`}
            className="rounded border px-4 py-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

