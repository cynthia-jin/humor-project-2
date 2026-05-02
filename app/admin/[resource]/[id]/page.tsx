import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import {
  getCrudResourceConfig,
  getAllCrudResourceSlugs,
  type SelectField,
} from "@/lib/admin/adminCrudConfig";
import { fetchSelectOptions, parseFormFieldValue } from "@/lib/admin/adminCrudUtils";
import DeleteConfirmButton from "../../DeleteConfirmButton";
import SubmitButton from "../../SubmitButton";
import {
  inputClass,
  checkboxClass,
  buttonSecondaryClass,
} from "@/lib/admin/styles";

function FieldLabel({
  text,
  required,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <label className="block mb-1 font-medium text-gray-200">
      {text}
      {required ? <span className="text-red-400 ml-1">*</span> : null}
    </label>
  );
}

export default async function AdminResourceEdit({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  const config = getCrudResourceConfig(resource);
  if (!config) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-2">Unknown admin resource</h1>
        <div className="text-gray-300">
          No CRUD config for: <span className="font-mono">{String(resource)}</span>
          <div className="mt-1 text-xs text-gray-400">
            typeof resource: <span className="font-mono">{typeof resource}</span>
          </div>
        </div>
        <div className="mt-2 text-gray-400 text-sm">
          Known CRUD resources:{" "}
          <span className="font-mono">{getAllCrudResourceSlugs().join(", ")}</span>
        </div>
      </main>
    );
  }
  const configNonNull = config;

  const { supabase } = await requireSuperadmin();

  const selectColumns = Array.from(new Set(configNonNull.defaultSelectColumns)).join(", ");

  const { data: item, error: itemError } = await supabase
    .from(configNonNull.table)
    .select(selectColumns)
    .eq(configNonNull.idColumn, id)
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
      .eq(configNonNull.idColumn, id);

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
      .eq(configNonNull.idColumn, id);

    if (error) {
      throw new Error(error.message);
    }

    redirect(`/admin/${configNonNull.resourceSlug}`);
  }

  return (
    <main className="p-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold capitalize">
            Edit {configNonNull.resourceSlug.replaceAll("-", " ")}
          </h1>
          <Link
            href={`/admin/${configNonNull.resourceSlug}`}
            className="underline text-indigo-400 hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            Back to list
          </Link>
        </div>
        <div className="mt-1 text-xs text-gray-500 font-mono break-all">
          ID: {id}
        </div>
      </div>

      <form action={updateResource} className="space-y-4">
        {configNonNull.formFields.map((field) => {
          const value = (item as unknown as Record<string, unknown>)[field.name];

          if (field.kind === "text") {
            return (
              <div key={field.name}>
                <FieldLabel text={field.label} required={field.required} />
                <input
                  type="text"
                  name={field.name}
                  defaultValue={(value as string | null) ?? ""}
                  required={field.required}
                  className={inputClass}
                />
              </div>
            );
          }

          if (field.kind === "textarea") {
            return (
              <div key={field.name}>
                <FieldLabel text={field.label} required={field.required} />
                <textarea
                  name={field.name}
                  defaultValue={(value as string | null) ?? ""}
                  required={field.required}
                  rows={field.rows ?? 4}
                  className={inputClass}
                />
              </div>
            );
          }

          if (field.kind === "number") {
            const numericValue =
              typeof value === "number" ? value : value == null ? "" : String(value);
            return (
              <div key={field.name}>
                <FieldLabel text={field.label} required={field.required} />
                <input
                  type="number"
                  name={field.name}
                  defaultValue={numericValue}
                  required={field.required}
                  step={field.step}
                  min={field.min}
                  className={inputClass}
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
                  className={checkboxClass}
                />
                <label className="font-medium text-gray-200">{field.label}</label>
              </div>
            );
          }

          const selectField = field;
          const options = optionsByFieldName.get(selectField.name) ?? [];
          const allowNull = selectField.nullOnEmpty ?? false;
          const selectValue = value == null ? "" : String(value);
          const selectRequired = !!selectField.required && !allowNull;

          return (
            <div key={field.name}>
              <FieldLabel text={field.label} required={selectRequired} />
              <select
                name={field.name}
                required={selectRequired}
                defaultValue={selectValue}
                className={inputClass}
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

        <div className="flex gap-3 pt-2">
          <SubmitButton label="Save Changes" pendingLabel="Saving…" />
          <Link
            href={`/admin/${configNonNull.resourceSlug}`}
            className={buttonSecondaryClass}
          >
            Cancel
          </Link>
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-800">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Danger zone
        </div>
        <form action={deleteResource}>
          <DeleteConfirmButton
            message={`Delete this ${configNonNull.resourceSlug.replaceAll(
              "-",
              " "
            )} row? This cannot be undone.`}
          />
        </form>
      </div>
    </main>
  );
}

