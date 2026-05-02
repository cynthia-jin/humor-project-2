import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp, truncateId } from "@/lib/admin/format";

function YesNoPill({ value }: { value: boolean | null | undefined }) {
  if (value === true) {
    return (
      <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-800">
        Yes
      </span>
    );
  }
  return (
    <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-gray-900 text-gray-500 border border-gray-800">
      No
    </span>
  );
}

export default async function UsersPage() {
  const { supabase } = await requireSuperadmin();

  const { data: users, error } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc"
    )
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  const userList = users ?? [];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Users / Profiles</h1>
      <div className="text-sm text-gray-400 mb-4">
        Showing {userList.length} users
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/20">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-900/60 sticky top-0">
            <tr className="text-gray-300">
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Superadmin</th>
              <th className="p-3 text-left font-medium">In Study</th>
              <th className="p-3 text-left font-medium">Matrix Admin</th>
              <th className="p-3 text-left font-medium">Created</th>
              <th className="p-3 text-left font-medium">User ID</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user: any, idx) => {
              const fullName =
                [user.first_name, user.last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || "-";
              return (
                <tr
                  key={user.id}
                  className={`border-b border-gray-800 align-top text-gray-200 ${
                    idx % 2 === 1 ? "bg-gray-900/10" : ""
                  }`}
                >
                  <td className="p-3">{user.email ?? "-"}</td>
                  <td className="p-3">{fullName}</td>
                  <td className="p-3">
                    <YesNoPill value={user.is_superadmin} />
                  </td>
                  <td className="p-3">
                    <YesNoPill value={user.is_in_study} />
                  </td>
                  <td className="p-3">
                    <YesNoPill value={user.is_matrix_admin} />
                  </td>
                  <td
                    className="p-3 text-gray-400 whitespace-nowrap"
                    title={user.created_datetime_utc ?? ""}
                  >
                    {formatTimestamp(user.created_datetime_utc)}
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-500" title={user.id}>
                    {truncateId(user.id)}
                  </td>
                </tr>
              );
            })}
            {userList.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-sm text-gray-400">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}