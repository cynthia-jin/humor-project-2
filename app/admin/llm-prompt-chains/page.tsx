import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

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

  const chainList = chains ?? [];
  const chainIds = chainList.map((c: any) => c.id);
  const requestIds = Array.from(
    new Set(chainList.map((c: any) => c.caption_request_id).filter(Boolean))
  );

  const [{ data: requests }, { data: responseRows }] = await Promise.all([
    requestIds.length
      ? supabase
          .from("caption_requests")
          .select("id, profile_id, image_id")
          .in("id", requestIds)
      : Promise.resolve({
          data: [] as {
            id: string;
            profile_id: string | null;
            image_id: string | null;
          }[],
        }),
    chainIds.length
      ? supabase
          .from("llm_model_responses")
          .select("llm_prompt_chain_id")
          .in("llm_prompt_chain_id", chainIds)
      : Promise.resolve({
          data: [] as { llm_prompt_chain_id: string }[],
        }),
  ]);

  const profileIds = Array.from(
    new Set((requests ?? []).map((r: any) => r.profile_id).filter(Boolean))
  );
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, email").in("id", profileIds)
    : { data: [] as { id: string; email: string | null }[] };

  const requestById = new Map(
    (requests ?? []).map((r: any) => [
      String(r.id),
      {
        profile_id: r.profile_id as string | null,
        image_id: r.image_id as string | null,
      },
    ])
  );
  const profileById = new Map(
    (profiles ?? []).map((r: any) => [String(r.id), r.email as string | null])
  );
  const responseCountByChain = new Map<string, number>();
  for (const row of responseRows ?? []) {
    const key = String((row as any).llm_prompt_chain_id);
    responseCountByChain.set(key, (responseCountByChain.get(key) ?? 0) + 1);
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">LLM Prompt Chains</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing latest {chainList.length} chains
      </div>

      <div className="space-y-4">
        {chainList.map((c: any) => {
          const request = c.caption_request_id
            ? requestById.get(String(c.caption_request_id))
            : null;
          const requesterEmail = request?.profile_id
            ? profileById.get(String(request.profile_id))
            : null;
          const responseCount =
            responseCountByChain.get(String(c.id)) ?? 0;

          return (
            <div
              key={String(c.id)}
              className="rounded-xl border border-gray-800 bg-gray-900/20 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="font-medium text-gray-100">
                  Chain for {requesterEmail ?? "(unknown user)"}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Responses:</span>{" "}
                  {responseCount}
                </div>
              </div>
              <div
                className="mt-2 text-xs text-gray-400"
                title={`Created: ${c.created_datetime_utc}\nModified: ${c.modified_datetime_utc}`}
              >
                Created: {formatTimestamp(c.created_datetime_utc)} · Modified:{" "}
                {formatTimestamp(c.modified_datetime_utc)}
              </div>
              <div className="mt-1 text-xs text-gray-500 break-all">
                Chain ID: {c.id} · Request: {c.caption_request_id ?? "-"}
              </div>
            </div>
          );
        })}

        {chainList.length === 0 && (
          <div className="text-sm text-gray-400">No prompt chains yet.</div>
        )}
      </div>
    </main>
  );
}
