"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-dark min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Humor Admin</h1>
          <p className="mt-1 text-sm text-gray-400">
            Sign in to access the admin console.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded border border-red-900 bg-red-950/40 p-3 text-sm text-red-300"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 text-xs text-gray-500">
          Access is restricted to authorized superadmin accounts.
        </div>
      </div>
    </main>
  );
}
