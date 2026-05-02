import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

export default async function CaptionsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: captions, error } = await supabase
    .from("captions")
    .select(
      "id, content, is_public, is_featured, like_count, profile_id, image_id, humor_flavor_id, created_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  const captionList = captions ?? [];
  const imageIds = Array.from(
    new Set(captionList.map((c: any) => c.image_id).filter(Boolean))
  );
  const profileIds = Array.from(
    new Set(captionList.map((c: any) => c.profile_id).filter(Boolean))
  );
  const flavorIds = Array.from(
    new Set(captionList.map((c: any) => c.humor_flavor_id).filter(Boolean))
  );

  const [{ data: imageRows }, { data: profileRows }, { data: flavorRows }] =
    await Promise.all([
      imageIds.length
        ? supabase.from("images").select("id, url").in("id", imageIds)
        : Promise.resolve({ data: [] as { id: string; url: string | null }[] }),
      profileIds.length
        ? supabase
            .from("profiles")
            .select("id, email, first_name, last_name")
            .in("id", profileIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              email: string | null;
              first_name: string | null;
              last_name: string | null;
            }[],
          }),
      flavorIds.length
        ? supabase.from("humor_flavors").select("id, slug").in("id", flavorIds)
        : Promise.resolve({ data: [] as { id: string; slug: string }[] }),
    ]);

  const imageById = new Map(
    (imageRows ?? []).map((r: any) => [String(r.id), r.url as string | null])
  );
  const profileById = new Map(
    (profileRows ?? []).map((r: any) => [
      String(r.id),
      {
        email: r.email as string | null,
        name:
          [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || null,
      },
    ])
  );
  const flavorById = new Map(
    (flavorRows ?? []).map((r: any) => [String(r.id), r.slug as string])
  );

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Captions</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing latest {captionList.length} captions
      </div>

      <div className="space-y-4">
        {captionList.map((caption: any) => {
          const imageUrl = caption.image_id
            ? imageById.get(String(caption.image_id))
            : null;
          const profile = caption.profile_id
            ? profileById.get(String(caption.profile_id))
            : null;
          const flavorSlug = caption.humor_flavor_id
            ? flavorById.get(String(caption.humor_flavor_id))
            : null;

          return (
            <div
              key={caption.id}
              className="rounded-xl border border-gray-800 bg-gray-900/20 p-4 flex gap-4"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Caption image"
                  className="h-24 w-24 rounded border border-gray-700 object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-24 w-24 rounded border border-gray-700 bg-gray-900 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                  No image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-100">
                  {caption.content ?? "No caption content"}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300">
                  <span>
                    <span className="text-gray-500">Likes:</span>{" "}
                    {caption.like_count}
                  </span>
                  <span>
                    <span className="text-gray-500">Public:</span>{" "}
                    {caption.is_public ? "Yes" : "No"}
                  </span>
                  <span>
                    <span className="text-gray-500">Featured:</span>{" "}
                    {caption.is_featured ? "Yes" : "No"}
                  </span>
                  <span>
                    <span className="text-gray-500">Flavor:</span>{" "}
                    {flavorSlug ?? "-"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-400">
                  <span className="text-gray-500">Author:</span>{" "}
                  {profile?.email ?? "-"}
                  {profile?.name ? ` (${profile.name})` : ""}
                </div>

                <div className="mt-1 text-xs text-gray-500 break-all">
                  Caption ID: {caption.id} · Created:{" "}
                  <span title={caption.created_datetime_utc}>
                    {formatTimestamp(caption.created_datetime_utc)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {captionList.length === 0 && (
          <div className="text-sm text-gray-400">No captions yet.</div>
        )}
      </div>
    </main>
  );
}
