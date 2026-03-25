import { requireSuperadmin } from "@/lib/auth";

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

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Humor Flavors</h1>

      <div className="space-y-4">
        {(flavors ?? []).map((f) => (
          <div key={String(f.id)} className="rounded-xl border p-4">
            <div className="font-medium">Slug: {f.slug}</div>
            <div className="text-sm text-gray-500 break-all">ID: {f.id}</div>
            {f.description ? (
              <div className="mt-2 text-sm text-gray-700">{f.description}</div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">No description</div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Created: {f.created_datetime_utc}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

