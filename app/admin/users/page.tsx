import { requireSuperadmin } from "@/lib/auth";

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

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Users / Profiles</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">First Name</th>
              <th className="p-3 text-left">Last Name</th>
              <th className="p-3 text-left">Superadmin</th>
              <th className="p-3 text-left">In Study</th>
              <th className="p-3 text-left">Matrix Admin</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">User ID</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user.id} className="border-b align-top">
                <td className="p-3">{user.email ?? "-"}</td>
                <td className="p-3">{user.first_name ?? "-"}</td>
                <td className="p-3">{user.last_name ?? "-"}</td>
                <td className="p-3">{user.is_superadmin ? "Yes" : "No"}</td>
                <td className="p-3">{user.is_in_study ? "Yes" : "No"}</td>
                <td className="p-3">{user.is_matrix_admin ? "Yes" : "No"}</td>
                <td className="p-3">
                  {user.created_datetime_utc ?? "-"}
                </td>
                <td className="p-3 break-all">{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}