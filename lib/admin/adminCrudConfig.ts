export type CrudFieldBase = {
  name: string;
  label: string;
  required?: boolean;
};

export type TextField = CrudFieldBase & {
  kind: "text";
  placeholder?: string;
};

export type TextareaField = CrudFieldBase & {
  kind: "textarea";
  placeholder?: string;
  rows?: number;
};

export type NumberField = CrudFieldBase & {
  kind: "number";
  placeholder?: string;
  step?: string;
  min?: number;
};

export type BooleanField = CrudFieldBase & {
  kind: "boolean";
};

export type SelectField = CrudFieldBase & {
  kind: "select";
  placeholder?: string;
  nullOnEmpty?: boolean;
  options: {
    table: string;
    valueColumn: string;
    labelColumn: string;
    orderBy?: string;
    orderAscending?: boolean;
  };
};

export type CrudField = TextField | TextareaField | NumberField | BooleanField | SelectField;

export type CrudResourceConfig = {
  // URL slug segment: /admin/<resource>/
  resourceSlug: string;
  table: string;
  idColumn: string;

  listFields: Array<{ name: string; label: string }>;

  // Form fields exclude audit + id.
  formFields: CrudField[];

  // The columns we allow updating (typically equals formFields + possible special cases).
  updateFields: Array<string>;

  // Columns to fetch for list/read.
  defaultSelectColumns: string[];
};

const crudResources: Record<string, CrudResourceConfig> = {
  terms: {
    resourceSlug: "terms",
    table: "terms",
    idColumn: "id",
    listFields: [
      { name: "id", label: "ID" },
      { name: "term", label: "Term" },
      { name: "priority", label: "Priority" },
      { name: "term_type_id", label: "Term Type ID" },
    ],
    formFields: [
      { kind: "text", name: "term", label: "Term", required: true },
      {
        kind: "textarea",
        name: "definition",
        label: "Definition",
        required: true,
        rows: 4,
      },
      {
        kind: "textarea",
        name: "example",
        label: "Example",
        required: true,
        rows: 4,
      },
      {
        kind: "number",
        name: "priority",
        label: "Priority",
        required: true,
        step: "1",
        min: 0,
      },
      {
        kind: "select",
        name: "term_type_id",
        label: "Term Type",
        nullOnEmpty: true,
        options: {
          table: "term_types",
          valueColumn: "id",
          labelColumn: "name",
          orderBy: "id",
          orderAscending: true,
        },
      },
    ],
    updateFields: ["term", "definition", "example", "priority", "term_type_id"],
    defaultSelectColumns: [
      "id",
      "term",
      "definition",
      "example",
      "priority",
      "term_type_id",
      "created_datetime_utc",
    ],
  },

  "allowed-signup-domains": {
    resourceSlug: "allowed-signup-domains",
    table: "allowed_signup_domains",
    idColumn: "id",
    listFields: [
      { name: "id", label: "ID" },
      { name: "apex_domain", label: "Apex Domain" },
    ],
    formFields: [
      { kind: "text", name: "apex_domain", label: "Apex Domain", required: true },
    ],
    updateFields: ["apex_domain"],
    defaultSelectColumns: ["id", "apex_domain", "created_datetime_utc"],
  },

  "whitelist-email-addresses": {
    resourceSlug: "whitelist-email-addresses",
    table: "whitelist_email_addresses",
    idColumn: "id",
    listFields: [
      { name: "id", label: "ID" },
      { name: "email_address", label: "Email Address" },
    ],
    formFields: [
      {
        kind: "text",
        name: "email_address",
        label: "Email Address",
        required: true,
      },
    ],
    updateFields: ["email_address"],
    defaultSelectColumns: ["id", "email_address", "created_datetime_utc"],
  },

  "caption-examples": {
    resourceSlug: "caption-examples",
    table: "caption_examples",
    idColumn: "id",
    listFields: [
      { name: "id", label: "ID" },
      { name: "priority", label: "Priority" },
      { name: "image_description", label: "Image Description" },
      { name: "image_id", label: "Image ID" },
    ],
    formFields: [
      {
        kind: "textarea",
        name: "image_description",
        label: "Image Description",
        required: true,
        rows: 3,
      },
      {
        kind: "textarea",
        name: "caption",
        label: "Caption",
        required: true,
        rows: 3,
      },
      {
        kind: "textarea",
        name: "explanation",
        label: "Explanation",
        required: true,
        rows: 4,
      },
      {
        kind: "number",
        name: "priority",
        label: "Priority",
        required: true,
        step: "1",
        min: 0,
      },
      {
        kind: "select",
        name: "image_id",
        label: "Image (optional)",
        nullOnEmpty: true,
        options: {
          table: "images",
          valueColumn: "id",
          labelColumn: "url",
          orderBy: "created_datetime_utc",
          orderAscending: false,
        },
      },
    ],
    updateFields: ["image_description", "caption", "explanation", "priority", "image_id"],
    defaultSelectColumns: [
      "id",
      "image_description",
      "caption",
      "explanation",
      "priority",
      "image_id",
      "created_datetime_utc",
    ],
  },

  "llm-providers": {
    resourceSlug: "llm-providers",
    table: "llm_providers",
    idColumn: "id",
    listFields: [
      { name: "id", label: "ID" },
      { name: "name", label: "Name" },
    ],
    formFields: [{ kind: "text", name: "name", label: "Name", required: true }],
    updateFields: ["name"],
    defaultSelectColumns: ["id", "name", "created_datetime_utc"],
  },

  "llm-models": {
    resourceSlug: "llm-models",
    table: "llm_models",
    idColumn: "id",
    listFields: [
      { name: "id", label: "ID" },
      { name: "name", label: "Name" },
      { name: "llm_provider_id", label: "Provider ID" },
      { name: "is_temperature_supported", label: "Temp Supported" },
    ],
    formFields: [
      { kind: "text", name: "name", label: "Model Name", required: true },
      {
        kind: "select",
        name: "llm_provider_id",
        label: "LLM Provider",
        required: true,
        options: {
          table: "llm_providers",
          valueColumn: "id",
          labelColumn: "name",
          orderBy: "id",
          orderAscending: true,
        },
      },
      {
        kind: "text",
        name: "provider_model_id",
        label: "Provider Model ID",
        required: true,
      },
      { kind: "boolean", name: "is_temperature_supported", label: "Temperature Supported" },
    ],
    updateFields: ["name", "llm_provider_id", "provider_model_id", "is_temperature_supported"],
    defaultSelectColumns: [
      "id",
      "name",
      "llm_provider_id",
      "provider_model_id",
      "is_temperature_supported",
      "created_datetime_utc",
    ],
  },
};

export function getCrudResourceConfig(resourceSlug: string): CrudResourceConfig | null {
  const normalized = resourceSlug.trim().toLowerCase().replaceAll("_", "-");
  const direct = crudResources[normalized];
  if (direct) return direct;

  // Prefer direct key lookup, but also fall back to `resourceSlug` property
  // in case param value and object key ever diverge.
  return (
    direct ??
    Object.values(crudResources).find(
      (c) => c.resourceSlug.trim().toLowerCase().replaceAll("_", "-") === normalized
    ) ??
    null
  );
}

export function getAllCrudResourceSlugs(): string[] {
  // Prefer the config's own `resourceSlug` so URL segments are always consistent
  return Object.values(crudResources).map((c) => c.resourceSlug);
}

