import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

export default async function HumorMixPage() {
  const { supabase } = await requireSuperadmin();

  const [{ data: mixes, error: mixesError }, { data: flavors, error: flavorsError }] =
    await Promise.all([
      supabase
        .from("humor_flavor_mix")
        .select("id, humor_flavor_id, caption_count, created_datetime_utc")
        .order("created_datetime_utc", { ascending: false })
        .limit(200),
      supabase.from("humor_flavors").select("id, slug"),
    ]);

  if (mixesError) {
    return <div className="p-8">{mixesError.message}</div>;
  }
  if (flavorsError) {
    return <div className="p-8">{flavorsError.message}</div>;
  }

  const flavorById = new Map<string, string>(
    (flavors ?? []).map((f) => [String(f.id), f.slug])
  );
  const mixList = mixes ?? [];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Humor Mix</h1>
      </div>
      <div className="text-sm text-gray-400 mb-4">
        Showing {mixList.length} mix entries
      </div>

      <div className="space-y-4">
        {mixList.map((m) => (
          <div
            key={String(m.id)}
            className="rounded-xl border border-gray-800 bg-gray-900/20 p-4"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="font-medium text-gray-100">
                {flavorById.get(String(m.humor_flavor_id)) ?? m.humor_flavor_id}
              </div>
              <div className="text-sm text-gray-300 tabular-nums">
                <span className="text-gray-500">Caption Count:</span>{" "}
                {m.caption_count}
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center gap-4">
              <div
                className="text-xs text-gray-400"
                title={m.created_datetime_utc}
              >
                ID: {m.id} · Created: {formatTimestamp(m.created_datetime_utc)}
              </div>
              <Link
                href={`/admin/humor-mix/${m.id}`}
                className="underline text-sm text-indigo-400 hover:text-indigo-300"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}

        {mixList.length === 0 && (
          <div className="text-sm text-gray-400">No mix entries yet.</div>
        )}
      </div>
    </main>
  );
}

