import { requireSuperadmin } from "@/lib/auth";

function truncate(value: unknown, maxLen: number) {
  const s = value == null ? "" : String(value);
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}…`;
}

export default async function HumorFlavorStepsPage() {
  const { supabase } = await requireSuperadmin();

  const [
    { data: steps, error: stepsError },
    { data: flavors },
    { data: inputTypes },
    { data: outputTypes },
    { data: models },
    { data: stepTypes },
  ] = await Promise.all([
    supabase
      .from("humor_flavor_steps")
      .select(
        "id, humor_flavor_id, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_temperature, description, llm_system_prompt, llm_user_prompt, created_datetime_utc"
      )
      .order("created_datetime_utc", { ascending: false })
      .limit(200),
    supabase.from("humor_flavors").select("id, slug"),
    supabase.from("llm_input_types").select("id, slug"),
    supabase.from("llm_output_types").select("id, slug"),
    supabase.from("llm_models").select("id, name"),
    supabase
      .from("humor_flavor_step_types")
      .select("id, slug, description"),
  ]);

  if (stepsError) {
    return <div className="p-8">{stepsError.message}</div>;
  }

  const flavorById = new Map<string, string>(
    (flavors ?? []).map((r) => [String(r.id), r.slug])
  );
  const inputById = new Map<string, string>(
    (inputTypes ?? []).map((r) => [String(r.id), r.slug])
  );
  const outputById = new Map<string, string>(
    (outputTypes ?? []).map((r) => [String(r.id), r.slug])
  );
  const modelById = new Map<string, string>(
    (models ?? []).map((r) => [String(r.id), r.name])
  );
  const stepTypeById = new Map<string, string>(
    (stepTypes ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return [
        String(row.id),
        (row.slug as string | undefined) ??
          (row.description as string | undefined) ??
          "",
      ];
    })
  );

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Humor Flavor Steps</h1>

      <div className="space-y-4">
        {(steps ?? []).map((s) => (
          <div key={String(s.id)} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div className="font-medium">
                Step {s.order_by} · {flavorById.get(String(s.humor_flavor_id)) ?? s.humor_flavor_id}
              </div>
              <div className="text-sm text-gray-500">
                Type: {stepTypeById.get(String(s.humor_flavor_step_type_id)) ?? s.humor_flavor_step_type_id}
              </div>
              <div className="text-sm text-gray-500">
                Model: {modelById.get(String(s.llm_model_id)) ?? s.llm_model_id}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700">
              <div>Input: {inputById.get(String(s.llm_input_type_id)) ?? s.llm_input_type_id}</div>
              <div>Output: {outputById.get(String(s.llm_output_type_id)) ?? s.llm_output_type_id}</div>
              <div>
                Temperature: {s.llm_temperature == null ? "-" : String(s.llm_temperature)}
              </div>
            </div>

            {s.description ? (
              <div className="mt-2 text-sm text-gray-700">{s.description}</div>
            ) : null}

            {s.llm_system_prompt ? (
              <div className="mt-3 text-xs text-gray-600">
                <div className="font-medium">System Prompt</div>
                <pre className="whitespace-pre-wrap">{truncate(s.llm_system_prompt, 400)}</pre>
              </div>
            ) : null}

            {s.llm_user_prompt ? (
              <div className="mt-3 text-xs text-gray-600">
                <div className="font-medium">User Prompt</div>
                <pre className="whitespace-pre-wrap">{truncate(s.llm_user_prompt, 400)}</pre>
              </div>
            ) : null}

            <div className="mt-3 text-xs text-gray-500">
              Created: {s.created_datetime_utc}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

