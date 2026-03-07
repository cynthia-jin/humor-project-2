import { requireSuperadmin } from "@/lib/auth";

export default async function CaptionsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: captions, error } = await supabase
    .from("captions")
    .select(
      "id, content, is_public, is_featured, like_count, profile_id, image_id, created_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Captions</h1>

      <div className="space-y-4">
        {captions?.map((caption: any) => (
          <div key={caption.id} className="rounded-xl border p-4">
            <div className="font-medium">
              {caption.content ?? "No caption content"}
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Likes: {caption.like_count}
            </div>
            <div className="text-sm text-gray-500">
              Public: {caption.is_public ? "Yes" : "No"} · Featured:{" "}
              {caption.is_featured ? "Yes" : "No"}
            </div>
            <div className="text-sm text-gray-500 break-all">
              Image ID: {caption.image_id}
            </div>
            <div className="text-sm text-gray-500 break-all">
              Profile ID: {caption.profile_id}
            </div>
            <div className="text-sm text-gray-500 break-all">
              Caption ID: {caption.id}
            </div>
            <div className="text-sm text-gray-500">
              Created: {caption.created_datetime_utc}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}