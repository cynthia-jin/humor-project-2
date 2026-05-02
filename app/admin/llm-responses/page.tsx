import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

export default async function LlmResponsesPage() {
  const { supabase } = await requireSuperadmin();

  const { data: responses, error } = await supabase
    .from("llm_model_responses")
    .select(
      "id, llm_model_id, caption_request_id, llm_temperature, processing_time_seconds, humor_flavor_id, llm_prompt_chain_id, humor_flavor_step_id, llm_system_prompt, llm_user_prompt, llm_model_response, created_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  const responseList = responses ?? [];
  const modelIds = Array.from(
    new Set(responseList.map((r: any) => r.llm_model_id).filter(Boolean))
  );
  const flavorIds = Array.from(
    new Set(responseList.map((r: any) => r.humor_flavor_id).filter(Boolean))
  );
  const stepIds = Array.from(
    new Set(
      responseList.map((r: any) => r.humor_flavor_step_id).filter(Boolean)
    )
  );

  const [{ data: models }, { data: providers }, { data: flavors }, { data: steps }] =
    await Promise.all([
      modelIds.length
        ? supabase
            .from("llm_models")
            .select("id, name, llm_provider_id")
            .in("id", modelIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              name: string;
              llm_provider_id: string | null;
            }[],
          }),
      supabase.from("llm_providers").select("id, name"),
      flavorIds.length
        ? supabase.from("humor_flavors").select("id, slug").in("id", flavorIds)
        : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
      stepIds.length
        ? supabase
            .from("humor_flavor_steps")
            .select("id, order_by, humor_flavor_step_type_id")
            .in("id", stepIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              order_by: number;
              humor_flavor_step_type_id: string | null;
            }[],
          }),
    ]);

  const providerById = new Map(
    (providers ?? []).map((r: any) => [String(r.id), r.name as string])
  );
  const modelById = new Map(
    (models ?? []).map((r: any) => {
      const providerName = r.llm_provider_id
        ? providerById.get(String(r.llm_provider_id))
        : null;
      return [
        String(r.id),
        {
          name: r.name as string,
          provider: providerName ?? null,
        },
      ];
    })
  );
  const flavorById = new Map(
    (flavors ?? []).map((r: any) => [String(r.id), r.slug as string])
  );
  const stepById = new Map(
    (steps ?? []).map((r: any) => [
      String(r.id),
      `Step ${r.order_by ?? "?"}`,
    ])
  );

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">LLM Responses</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing latest {responseList.length} responses
      </div>

      <div className="space-y-4">
        {responseList.map((r: any) => {
          const model = r.llm_model_id
            ? modelById.get(String(r.llm_model_id))
            : null;
          const flavorSlug = r.humor_flavor_id
            ? flavorById.get(String(r.humor_flavor_id))
            : null;
          const stepLabel = r.humor_flavor_step_id
            ? stepById.get(String(r.humor_flavor_step_id))
            : null;

          return (
            <div
              key={String(r.id)}
              className="rounded-xl border border-gray-800 bg-gray-900/20 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div className="font-medium text-gray-100">
                  {model
                    ? `${model.provider ? `${model.provider} / ` : ""}${model.name}`
                    : "(unknown model)"}
                </div>
                <div className="text-sm text-gray-400">
                  Temp:{" "}
                  {r.llm_temperature == null ? "-" : String(r.llm_temperature)}
                  {r.processing_time_seconds != null
                    ? ` · ${Number(r.processing_time_seconds).toFixed(2)}s`
                    : ""}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                <span>
                  <span className="text-gray-500">Flavor:</span>{" "}
                  {flavorSlug ?? "-"}
                </span>
                <span>
                  <span className="text-gray-500">Step:</span>{" "}
                  {stepLabel ?? "-"}
                </span>
                <span>
                  <span className="text-gray-500">Chain:</span>{" "}
                  {r.llm_prompt_chain_id ?? "-"}
                </span>
                <span title={r.created_datetime_utc}>
                  <span className="text-gray-500">Created:</span>{" "}
                  {formatTimestamp(r.created_datetime_utc)}
                </span>
              </div>

              {r.llm_system_prompt ? (
                <details className="mt-3 text-xs text-gray-300 group">
                  <summary className="font-medium text-gray-200 cursor-pointer select-none hover:text-white list-none flex items-center gap-1">
                    <span className="text-gray-500 group-open:rotate-90 inline-block transition-transform">
                      ▸
                    </span>
                    System Prompt
                    <span className="text-gray-500 font-normal">
                      ({String(r.llm_system_prompt).length} chars)
                    </span>
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-gray-300 rounded border border-gray-800 bg-gray-950 p-2">
                    {String(r.llm_system_prompt)}
                  </pre>
                </details>
              ) : null}

              {r.llm_user_prompt ? (
                <details className="mt-3 text-xs text-gray-300 group">
                  <summary className="font-medium text-gray-200 cursor-pointer select-none hover:text-white list-none flex items-center gap-1">
                    <span className="text-gray-500 group-open:rotate-90 inline-block transition-transform">
                      ▸
                    </span>
                    User Prompt
                    <span className="text-gray-500 font-normal">
                      ({String(r.llm_user_prompt).length} chars)
                    </span>
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-gray-300 rounded border border-gray-800 bg-gray-950 p-2">
                    {String(r.llm_user_prompt)}
                  </pre>
                </details>
              ) : null}

              {r.llm_model_response ? (
                <details className="mt-3 text-sm text-gray-200 group" open>
                  <summary className="font-medium text-gray-100 cursor-pointer select-none hover:text-white list-none flex items-center gap-1">
                    <span className="text-gray-500 group-open:rotate-90 inline-block transition-transform">
                      ▸
                    </span>
                    Model Response
                    <span className="text-gray-500 font-normal text-xs">
                      ({String(r.llm_model_response).length} chars)
                    </span>
                  </summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap text-gray-200 rounded border border-gray-800 bg-gray-950 p-2">
                    {String(r.llm_model_response)}
                  </pre>
                </details>
              ) : null}
            </div>
          );
        })}

        {responseList.length === 0 && (
          <div className="text-sm text-gray-400">No LLM responses yet.</div>
        )}
      </div>
    </main>
  );
}
