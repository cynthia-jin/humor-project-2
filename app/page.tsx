import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Humor Admin</h1>
        <p className="text-gray-600">Admin area for the Humor project.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="underline">
            Login
          </Link>
          <Link href="/admin" className="underline">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}