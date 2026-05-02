import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

export default async function CaptionRequestsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: requests, error } = await supabase
    .from("caption_requests")
    .select(
      "id, profile_id, image_id, created_datetime_utc, modified_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  const requestList = requests ?? [];
  const profileIds = Array.from(
    new Set(requestList.map((r: any) => r.profile_id).filter(Boolean))
  );
  const imageIds = Array.from(
    new Set(requestList.map((r: any) => r.image_id).filter(Boolean))
  );
  const requestIds = requestList.map((r: any) => r.id);

  const [
    { data: profileRows },
    { data: imageRows },
    { data: captionRows },
  ] = await Promise.all([
    profileIds.length
      ? supabase
          .from("profiles")
          .select("id, email")
          .in("id", profileIds)
      : Promise.resolve({
          data: [] as { id: string; email: string | null }[],
        }),
    imageIds.length
      ? supabase.from("images").select("id, url").in("id", imageIds)
      : Promise.resolve({ data: [] as { id: string; url: string | null }[] }),
    requestIds.length
      ? supabase
          .from("captions")
          .select("caption_request_id")
          .in("caption_request_id", requestIds)
      : Promise.resolve({ data: [] as { caption_request_id: string }[] }),
  ]);

  const profileById = new Map(
    (profileRows ?? []).map((r: any) => [String(r.id), r.email as string | null])
  );
  const imageById = new Map(
    (imageRows ?? []).map((r: any) => [String(r.id), r.url as string | null])
  );
  const captionCountByRequest = new Map<string, number>();
  for (const row of captionRows ?? []) {
    const key = String((row as any).caption_request_id);
    captionCountByRequest.set(key, (captionCountByRequest.get(key) ?? 0) + 1);
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Caption Requests</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing latest {requestList.length} requests
      </div>

      <div className="space-y-4">
        {requestList.map((r: any) => {
          const email = r.profile_id
            ? profileById.get(String(r.profile_id))
            : null;
          const url = r.image_id ? imageById.get(String(r.image_id)) : null;
          const captionCount = captionCountByRequest.get(String(r.id)) ?? 0;

          return (
            <div
              key={String(r.id)}
              className="rounded-xl border border-gray-800 bg-gray-900/20 p-4 flex gap-4"
            >
              {url ? (
                <img
                  src={url}
                  alt="Request image"
                  className="h-20 w-20 rounded border border-gray-700 object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded border border-gray-700 bg-gray-900 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                  No image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div className="font-medium text-gray-100">
                    Requested by {email ?? "(unknown)"}
                  </div>
                  <div
                    className="text-xs text-gray-400"
                    title={r.created_datetime_utc}
                  >
                    Created: {formatTimestamp(r.created_datetime_utc)}
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300">
                  <span>
                    <span className="text-gray-500">Captions generated:</span>{" "}
                    {captionCount}
                  </span>
                  <span title={r.modified_datetime_utc}>
                    <span className="text-gray-500">Modified:</span>{" "}
                    {formatTimestamp(r.modified_datetime_utc)}
                  </span>
                </div>

                <div className="mt-1 text-xs text-gray-500 break-all">
                  Request ID: {r.id} · Profile: {r.profile_id} · Image:{" "}
                  {r.image_id}
                </div>
              </div>
            </div>
          );
        })}

        {requestList.length === 0 && (
          <div className="text-sm text-gray-400">No caption requests yet.</div>
        )}
      </div>
    </main>
  );
}
