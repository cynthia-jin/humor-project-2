import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperadmin();

  return (
    <div className="min-h-screen">
      <nav className="border-b px-8 py-4 flex gap-6">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/images">Images</Link>
        <Link href="/admin/captions">Captions</Link>
        <Link href="/admin/humor-flavors">Humor Flavors</Link>
        <Link href="/admin/humor-flavor-steps">Flavor Steps</Link>
        <Link href="/admin/humor-mix">Humor Mix</Link>
        <Link href="/admin/llm-prompt-chains">LLM Prompt Chains</Link>
        <Link href="/admin/llm-responses">LLM Responses</Link>
        <Link href="/admin/terms">Terms</Link>
        <Link href="/admin/allowed-signup-domains">Allowed Domains</Link>
        <Link href="/admin/whitelist-email-addresses">Whitelist Emails</Link>
        <Link href="/admin/caption-requests">Caption Requests</Link>
        <Link href="/admin/caption-examples">Caption Examples</Link>
        <Link href="/admin/llm-providers">LLM Providers</Link>
        <Link href="/admin/llm-models">LLM Models</Link>
      </nav>
      {children}
    </div>
  );
}