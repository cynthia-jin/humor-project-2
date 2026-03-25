import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";

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

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Humor Mix</h1>
      </div>

      <div className="space-y-4">
        {(mixes ?? []).map((m) => (
          <div key={String(m.id)} className="rounded-xl border p-4">
            <div className="flex items-baseline justify-between gap-4">
              <div className="font-medium">
                {flavorById.get(String(m.humor_flavor_id)) ?? m.humor_flavor_id}
              </div>
              <div className="text-sm text-gray-500">
                Caption Count: {m.caption_count}
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center gap-4">
              <div className="text-xs text-gray-500">
                ID: {m.id} · Created: {m.created_datetime_utc}
              </div>
              <Link
                href={`/admin/humor-mix/${m.id}`}
                className="underline text-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

