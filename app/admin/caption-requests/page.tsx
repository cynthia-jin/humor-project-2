import { requireSuperadmin } from "@/lib/auth";

export default async function CaptionRequestsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: requests, error } = await supabase
    .from("caption_requests")
    .select(
      "id, profile_id, image_id, created_by_user_id, modified_by_user_id, created_datetime_utc, modified_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Caption Requests</h1>

      <div className="space-y-4">
        {(requests ?? []).map((r) => (
          <div key={String(r.id)} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="font-medium">ID: {r.id}</div>
              <div className="text-xs text-gray-500">
                Created: {r.created_datetime_utc}
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              Profile ID: <span className="font-mono">{r.profile_id}</span>
              {" · "}
              Image ID: <span className="font-mono">{r.image_id}</span>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Created by: <span className="font-mono">{r.created_by_user_id}</span>
              {" · "}
              Modified by: <span className="font-mono">{r.modified_by_user_id}</span>
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Modified: {r.modified_datetime_utc}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

