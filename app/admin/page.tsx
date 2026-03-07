import { requireSuperadmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const { supabase } = await requireSuperadmin();

  const [{ count: userCount }, { count: imageCount }, { count: captionCount }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("images").select("*", { count: "exact", head: true }),
      supabase.from("captions").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Users", value: userCount ?? 0 },
    { label: "Images", value: imageCount ?? 0 },
    { label: "Captions", value: captionCount ?? 0 },
    {
      label: "Avg captions/image",
      value:
        imageCount && captionCount
          ? (captionCount / imageCount).toFixed(1)
          : "0",
    },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border rounded-xl p-5 shadow-sm">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold mt-2">{stat.value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}