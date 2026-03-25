import { requireSuperadmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const { supabase } = await requireSuperadmin();

  const [
    { count: userCount },
    { count: imageCount },
    { count: captionCount },
    { count: llmModelCount },
    { count: llmProviderCount },
    { count: termCount },
    { count: whitelistEmailCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("llm_models").select("*", { count: "exact", head: true }),
    supabase
      .from("llm_providers")
      .select("*", { count: "exact", head: true }),
    supabase.from("terms").select("*", { count: "exact", head: true }),
    supabase
      .from("whitelist_email_addresses")
      .select("*", { count: "exact", head: true }),
  ]);

  const [
    { data: recentUsers },
    { data: recentImages },
    { data: recentCaptions },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("images")
      .select("id, url, is_public, is_common_use, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("captions")
      .select("id, content, image_id, like_count, is_public, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Users", value: userCount ?? 0 },
    { label: "Images", value: imageCount ?? 0 },
    { label: "Captions", value: captionCount ?? 0 },
    { label: "LLM Models", value: llmModelCount ?? 0 },
    { label: "LLM Providers", value: llmProviderCount ?? 0 },
    { label: "Terms", value: termCount ?? 0 },
    { label: "Whitelist Emails", value: whitelistEmailCount ?? 0 },
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
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-gray-800 rounded-xl bg-gray-900/30 p-5 shadow-sm"
          >
            <div className="text-sm text-gray-400">{stat.label}</div>
            <div className="text-2xl font-semibold mt-2 text-gray-100">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">
          Recent activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Recent users
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentUsers ?? []).map((u) => (
                    <tr key={u.id} className="border-t border-gray-800">
                      <td className="p-2 text-gray-200 break-all">
                        {u.email ?? "-"}
                      </td>
                      <td className="p-2 text-gray-200">
                        {u.is_superadmin ? "Superadmin" : "User"}
                      </td>
                      <td className="p-2 text-gray-400">
                        {u.created_datetime_utc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Recent images
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-2">Preview</th>
                    <th className="p-2">URL</th>
                    <th className="p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentImages ?? []).map((img) => (
                    <tr key={img.id} className="border-t border-gray-800">
                      <td className="p-2">
                        {img.url ? (
                          <img
                            src={img.url}
                            alt="thumb"
                            className="h-10 w-10 rounded border border-gray-700 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded border border-gray-700 flex items-center justify-center text-[10px] text-gray-500">
                            -
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-gray-200 break-all max-w-[260px]">
                        {img.url ?? "-"}
                      </td>
                      <td className="p-2 text-gray-400">
                        {img.created_datetime_utc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Recent captions
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-2">Content</th>
                    <th className="p-2">Likes</th>
                    <th className="p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentCaptions ?? []).map((c) => (
                    <tr key={c.id} className="border-t border-gray-800">
                      <td className="p-2 text-gray-200">
                        <div className="max-w-[340px] break-all">
                          {c.content ?? "-"}
                        </div>
                      </td>
                      <td className="p-2 text-gray-200">{c.like_count}</td>
                      <td className="p-2 text-gray-400">
                        {c.created_datetime_utc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}