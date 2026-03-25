import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin">
            Dashboard
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/users">
            Users
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/images">
            Images
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/captions">
            Captions
          </Link>

          <div className="h-3" />

          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/humor-flavors">
            Humor Flavors
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/humor-flavor-steps">
            Flavor Steps
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/humor-mix">
            Humor Mix
          </Link>

          <div className="h-3" />

          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/llm-prompt-chains">
            LLM Prompt Chains
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/llm-responses">
            LLM Responses
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/llm-providers">
            LLM Providers
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/llm-models">
            LLM Models
          </Link>

          <div className="h-3" />

          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/terms">
            Terms
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/allowed-signup-domains">
            Allowed Domains
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/whitelist-email-addresses">
            Whitelist Emails
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/caption-requests">
            Caption Requests
          </Link>
          <Link className="block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white" href="/admin/caption-examples">
            Caption Examples
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400">Signed in as</div>
          <div className="text-sm font-medium break-all mt-1">{user?.email ?? "Unknown user"}</div>
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