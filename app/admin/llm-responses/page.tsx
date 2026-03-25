import { requireSuperadmin } from "@/lib/auth";

function truncate(value: unknown, maxLen: number) {
  const s = value == null ? "" : String(value);
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}…`;
}

export default async function LlmResponsesPage() {
  const { supabase } = await requireSuperadmin();

  // Table is `llm_model_responses` per your schema.
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

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">LLM Responses</h1>

      <div className="space-y-4">
        {(responses ?? []).map((r) => (
          <div key={String(r.id)} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="font-medium">Response: {r.id}</div>
              <div className="text-sm text-gray-500">
                Model: {r.llm_model_id} · Temp:{" "}
                {r.llm_temperature == null ? "-" : String(r.llm_temperature)}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Caption Request: {r.caption_request_id} · Chain:{" "}
              {r.llm_prompt_chain_id ?? "-"} · Step:{" "}
              {r.humor_flavor_step_id ?? "-"} · Created: {r.created_datetime_utc}
            </div>

            {r.llm_system_prompt ? (
              <div className="mt-3 text-xs text-gray-700">
                <div className="font-medium">System Prompt</div>
                <pre className="whitespace-pre-wrap">
                  {truncate(r.llm_system_prompt, 300)}
                </pre>
              </div>
            ) : null}

            {r.llm_user_prompt ? (
              <div className="mt-3 text-xs text-gray-700">
                <div className="font-medium">User Prompt</div>
                <pre className="whitespace-pre-wrap">
                  {truncate(r.llm_user_prompt, 300)}
                </pre>
              </div>
            ) : null}

            {r.llm_model_response ? (
              <div className="mt-3 text-sm text-gray-800">
                <div className="font-medium">Model Response</div>
                <pre className="whitespace-pre-wrap">
                  {truncate(r.llm_model_response, 500)}
                </pre>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}

