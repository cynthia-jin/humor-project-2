import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

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
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Humor Flavor Steps</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing {(steps ?? []).length} flavor steps
      </div>

      <div className="space-y-4">
        {(steps ?? []).map((s) => (
          <div
            key={String(s.id)}
            className="rounded-xl border border-gray-800 bg-gray-900/20 p-4"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div className="font-medium text-gray-100">
                Step {s.order_by} · {flavorById.get(String(s.humor_flavor_id)) ?? s.humor_flavor_id}
              </div>
              <div className="text-sm text-gray-400">
                Type: {stepTypeById.get(String(s.humor_flavor_step_type_id)) ?? s.humor_flavor_step_type_id}
              </div>
              <div className="text-sm text-gray-400">
                Model: {modelById.get(String(s.llm_model_id)) ?? s.llm_model_id}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-300">
              <div>Input: {inputById.get(String(s.llm_input_type_id)) ?? s.llm_input_type_id}</div>
              <div>Output: {outputById.get(String(s.llm_output_type_id)) ?? s.llm_output_type_id}</div>
              <div>
                Temperature: {s.llm_temperature == null ? "-" : String(s.llm_temperature)}
              </div>
            </div>

            {s.description ? (
              <div className="mt-2 text-sm text-gray-200">{s.description}</div>
            ) : null}

            {s.llm_system_prompt ? (
              <details className="mt-3 text-xs text-gray-300 group">
                <summary className="font-medium text-gray-200 cursor-pointer select-none hover:text-white list-none flex items-center gap-1">
                  <span className="text-gray-500 group-open:rotate-90 inline-block transition-transform">
                    ▸
                  </span>
                  System Prompt
                  <span className="text-gray-500 font-normal">
                    ({String(s.llm_system_prompt).length} chars)
                  </span>
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-gray-300 rounded border border-gray-800 bg-gray-950 p-2">
                  {String(s.llm_system_prompt)}
                </pre>
              </details>
            ) : null}

            {s.llm_user_prompt ? (
              <details className="mt-3 text-xs text-gray-300 group">
                <summary className="font-medium text-gray-200 cursor-pointer select-none hover:text-white list-none flex items-center gap-1">
                  <span className="text-gray-500 group-open:rotate-90 inline-block transition-transform">
                    ▸
                  </span>
                  User Prompt
                  <span className="text-gray-500 font-normal">
                    ({String(s.llm_user_prompt).length} chars)
                  </span>
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-gray-300 rounded border border-gray-800 bg-gray-950 p-2">
                  {String(s.llm_user_prompt)}
                </pre>
              </details>
            ) : null}

            <div
              className="mt-3 text-xs text-gray-400"
              title={s.created_datetime_utc}
            >
              Created: {formatTimestamp(s.created_datetime_utc)}
            </div>
          </div>
        ))}

        {(steps ?? []).length === 0 && (
          <div className="text-sm text-gray-400">
            No flavor steps yet.
          </div>
        )}
      </div>
    </main>
  );
}

