import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

export default async function HumorFlavorsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  const flavorList = flavors ?? [];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Humor Flavors</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing {flavorList.length} flavors
      </div>

      <div className="space-y-4">
        {flavorList.map((f) => (
          <div
            key={String(f.id)}
            className="rounded-xl border border-gray-800 bg-gray-900/20 p-4"
          >
            <div className="font-medium text-gray-100">Slug: {f.slug}</div>
            <div className="text-sm text-gray-400 break-all">ID: {f.id}</div>
            {f.description ? (
              <div className="mt-2 text-sm text-gray-200">{f.description}</div>
            ) : (
              <div className="mt-2 text-sm text-gray-400">No description</div>
            )}
            <div
              className="mt-2 text-xs text-gray-400"
              title={f.created_datetime_utc}
            >
              Created: {formatTimestamp(f.created_datetime_utc)}
            </div>
          </div>
        ))}

        {flavorList.length === 0 && (
          <div className="text-sm text-gray-400">No humor flavors yet.</div>
        )}
      </div>
    </main>
  );
}

