import { requireSuperadmin } from "@/lib/auth";

export default async function LlmPromptChainsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: chains, error } = await supabase
    .from("llm_prompt_chains")
    .select("id, caption_request_id, created_datetime_utc, modified_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">LLM Prompt Chains</h1>

      <div className="space-y-4">
        {(chains ?? []).map((c) => (
          <div key={String(c.id)} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="font-medium">
                Chain ID: {c.id}
              </div>
              <div className="text-sm text-gray-500">
                Caption Request: {c.caption_request_id}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Created: {c.created_datetime_utc} · Modified:{" "}
              {c.modified_datetime_utc}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

