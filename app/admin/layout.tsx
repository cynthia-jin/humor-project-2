import { requireSuperadmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebarNav from "./AdminSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSuperadmin();

  async function logout() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="admin-dark min-h-screen flex">
      <aside className="w-72 sticky top-0 h-screen flex flex-col border-r border-gray-800 bg-gray-950">
        <div className="p-6 border-b border-gray-800">
          <div className="text-lg font-bold">Humor Admin</div>
          <div className="text-xs text-gray-400 mt-1">
            Management console
          </div>
        </div>

        <AdminSidebarNav />

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400">Signed in as</div>
          <div
            className="text-sm font-medium truncate mt-1"
            title={user?.email ?? ""}
          >
            {user?.email ?? "Unknown user"}
          </div>
          <form action={logout} className="mt-4">
            <button className="w-full rounded bg-gray-900 border border-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}