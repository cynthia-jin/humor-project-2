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
      </nav>
      {children}
    </div>
  );
}