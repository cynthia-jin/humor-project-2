import type { CrudField, SelectField } from "@/lib/admin/adminCrudConfig";
import { getCrudResourceConfig } from "@/lib/admin/adminCrudConfig";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SelectOption = {
  value: string;
  label: string;
};

export async function fetchSelectOptions(
  supabase: SupabaseClient,
  field: SelectField
): Promise<SelectOption[]> {
  const { data, error } = await supabase
    .from(field.options.table)
    .select(`${field.options.valueColumn}, ${field.options.labelColumn}`)
    .order(field.options.orderBy ?? field.options.valueColumn, {
      ascending: field.options.orderAscending ?? true,
    });

  if (error) {
    // Avoid crashing the entire admin page if dropdown data fails to load
    // (e.g. RLS/permissions). The UI will simply render an empty select.
    // eslint-disable-next-line no-console
    console.error(
      `Failed to load select options for ${field.name} from ${field.options.table}:`,
      error.message
    );
    return [];
  }

  const rows = (data ?? []) as unknown[];
  return rows.map((row) => {
    const rawValue = (row as Record<string, unknown>)[field.options.valueColumn];
    const rawLabel = (row as Record<string, unknown>)[field.options.labelColumn];
    const value = rawValue == null ? "" : String(rawValue);

    const labelRaw = rawLabel == null ? "" : String(rawLabel);
    const label = labelRaw || value;
    return { value, label };
  });
}

export function parseFormFieldValue(
  field: CrudField,
  formData: FormData
): unknown {
  const raw = formData.get(field.name);

  if (field.kind === "boolean") {
    // Unchecked checkbox => missing from formData => false.
    return raw === "on";
  }

  if (raw == null) {
    if ("nullOnEmpty" in field && field.nullOnEmpty) return null;
    return field.kind === "number" ? null : "";
  }

  const asString = raw.toString();

  if (asString === "") {
    if ("nullOnEmpty" in field && field.nullOnEmpty) return null;
    return field.kind === "number" ? null : "";
  }

  if (field.kind === "number") {
    const num = Number(asString);
    return Number.isFinite(num) ? num : null;
  }

  return asString;
}

export function getCrudResourceGuard(resourceSlug: string) {
  const config = getCrudResourceConfig(resourceSlug);
  return config;
}

