import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/admin/format";

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
    { count: totalVotes },
    { count: studyVotes },
    { count: captionsWithLikes },
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
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    supabase
      .from("caption_votes")
      .select("*", { count: "exact", head: true })
      .eq("is_from_study", true),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .gt("like_count", 0),
  ]);

  const [
    { data: recentUsers },
    { data: recentImages },
    { data: recentCaptions },
    { data: topCaptions },
    { data: captionLikeRows },
    { data: voterRows },
    { data: humorFlavors },
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
    supabase
      .from("captions")
      .select("id, content, image_id, like_count, humor_flavor_id")
      .order("like_count", { ascending: false })
      .order("id", { ascending: true })
      .limit(10),
    supabase
      .from("captions")
      .select("id, like_count, humor_flavor_id")
      .range(0, 49999),
    supabase
      .from("caption_votes")
      .select("profile_id, vote_value")
      .range(0, 49999),
    supabase.from("humor_flavors").select("id, slug"),
  ]);

  const likeCounts = (captionLikeRows ?? []).map((r: any) => Number(r.like_count) || 0);
  const totalLikes = likeCounts.reduce((a, b) => a + b, 0);
  const maxLikes = likeCounts.length ? Math.max(...likeCounts) : 0;
  const avgLikes = likeCounts.length ? totalLikes / likeCounts.length : 0;
  const pctEverLiked = captionCount
    ? ((captionsWithLikes ?? 0) / captionCount) * 100
    : 0;

  const buckets = [
    { label: "0", test: (n: number) => n === 0 },
    { label: "1", test: (n: number) => n === 1 },
    { label: "2–5", test: (n: number) => n >= 2 && n <= 5 },
    { label: "6–10", test: (n: number) => n >= 6 && n <= 10 },
    { label: "11+", test: (n: number) => n >= 11 },
  ];
  const bucketCounts = buckets.map((b) => ({
    label: b.label,
    count: likeCounts.filter(b.test).length,
  }));
  const maxBucket = Math.max(1, ...bucketCounts.map((b) => b.count));

  const flavorSlugById = new Map(
    (humorFlavors ?? []).map((f: any) => [String(f.id), f.slug as string])
  );
  const flavorAgg = new Map<string, { sum: number; n: number }>();
  for (const row of captionLikeRows ?? []) {
    const key = row.humor_flavor_id == null ? "null" : String(row.humor_flavor_id);
    const prev = flavorAgg.get(key) ?? { sum: 0, n: 0 };
    prev.sum += Number(row.like_count) || 0;
    prev.n += 1;
    flavorAgg.set(key, prev);
  }
  const flavorStats = Array.from(flavorAgg.entries())
    .map(([key, v]) => ({
      label: key === "null" ? "(none)" : flavorSlugById.get(key) ?? key,
      avg: v.sum / v.n,
      n: v.n,
    }))
    .filter((f) => f.n >= 3)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  const distinctVoters = new Set(
    (voterRows ?? []).map((r: any) => r.profile_id)
  ).size;

  const voteValueMap = new Map<number, number>();
  for (const r of voterRows ?? []) {
    const v = Number(r.vote_value);
    voteValueMap.set(v, (voteValueMap.get(v) ?? 0) + 1);
  }
  const voteValueDist = Array.from(voteValueMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);
  const maxVoteValueCount = Math.max(1, ...voteValueDist.map((v) => v.count));

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

  const ratingStats = [
    { label: "Total votes", value: totalVotes ?? 0 },
    { label: "Distinct voters", value: distinctVoters },
    { label: "Study votes", value: studyVotes ?? 0 },
    { label: "Captions with ≥1 like", value: captionsWithLikes ?? 0 },
    { label: "% captions voted", value: `${pctEverLiked.toFixed(1)}%` },
    { label: "Total likes", value: totalLikes },
    { label: "Avg likes/caption", value: avgLikes.toFixed(2) },
    { label: "Max likes", value: maxLikes },
  ];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-100">Platform</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          Caption ratings
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {ratingStats.map((stat) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Likes per caption (distribution)
            </div>
            <div className="p-5 space-y-2">
              {bucketCounts.map((b) => (
                <div key={b.label} className="flex items-center gap-3 text-sm">
                  <div className="w-14 text-gray-400">{b.label}</div>
                  <div className="flex-1 h-3 rounded bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${(b.count / maxBucket) * 100}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-gray-200 tabular-nums">
                    {b.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Vote value distribution
            </div>
            <div className="p-5 space-y-2">
              {voteValueDist.length === 0 ? (
                <div className="text-sm text-gray-400">No votes yet.</div>
              ) : (
                voteValueDist.map((v) => (
                  <div key={v.value} className="flex items-center gap-3 text-sm">
                    <div className="w-14 text-gray-400">
                      {v.value > 0 ? `+${v.value}` : v.value}
                    </div>
                    <div className="flex-1 h-3 rounded bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${(v.count / maxVoteValueCount) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="w-16 text-right text-gray-200 tabular-nums">
                      {v.count}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Top-rated captions
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-2">Caption</th>
                    <th className="p-2 w-16 text-right">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {(topCaptions ?? []).map((c: any) => (
                    <tr key={c.id} className="border-t border-gray-800">
                      <td className="p-2 text-gray-200">
                        <div className="max-w-[340px] line-clamp-2">
                          {c.content ?? "-"}
                        </div>
                      </td>
                      <td className="p-2 text-right text-gray-200 tabular-nums">
                        {c.like_count}
                      </td>
                    </tr>
                  ))}
                  {(topCaptions ?? []).length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="p-2 text-sm text-gray-400"
                      >
                        No captions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-gray-800 rounded-xl bg-gray-900/20 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 text-gray-100 font-medium">
              Humor flavors by avg likes
              <span className="ml-2 text-xs text-gray-500 font-normal">
                (min 3 captions)
              </span>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="p-2">Flavor</th>
                    <th className="p-2 w-20 text-right">Avg likes</th>
                    <th className="p-2 w-20 text-right">Captions</th>
                  </tr>
                </thead>
                <tbody>
                  {flavorStats.map((f) => (
                    <tr key={f.label} className="border-t border-gray-800">
                      <td className="p-2 text-gray-200">{f.label}</td>
                      <td className="p-2 text-right text-gray-200 tabular-nums">
                        {f.avg.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-gray-400 tabular-nums">
                        {f.n}
                      </td>
                    </tr>
                  ))}
                  {flavorStats.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-2 text-sm text-gray-400">
                        Not enough data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

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
                      <td className="p-2 text-gray-200">
                        <div className="truncate max-w-[220px]" title={u.email ?? ""}>
                          {u.email ?? "-"}
                        </div>
                      </td>
                      <td className="p-2 text-gray-200">
                        {u.is_superadmin ? "Superadmin" : "User"}
                      </td>
                      <td
                        className="p-2 text-gray-400 whitespace-nowrap"
                        title={u.created_datetime_utc ?? ""}
                      >
                        {formatTimestamp(u.created_datetime_utc)}
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
                      <td className="p-2 text-gray-300 max-w-[260px]">
                        <div className="truncate" title={img.url ?? ""}>
                          {img.url ?? "-"}
                        </div>
                      </td>
                      <td
                        className="p-2 text-gray-400 whitespace-nowrap"
                        title={img.created_datetime_utc ?? ""}
                      >
                        {formatTimestamp(img.created_datetime_utc)}
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
                        <div className="max-w-[340px] line-clamp-2">
                          {c.content ?? "-"}
                        </div>
                      </td>
                      <td className="p-2 text-gray-200 tabular-nums">
                        {c.like_count}
                      </td>
                      <td
                        className="p-2 text-gray-400 whitespace-nowrap"
                        title={c.created_datetime_utc ?? ""}
                      >
                        {formatTimestamp(c.created_datetime_utc)}
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