"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    console.log("STEP 1: button clicked");
    setLoading(true);

    try {
      console.log("STEP 2: origin =", window.location.origin);
      console.log(
        "STEP 3: supabase url =",
        process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      console.log(
        "STEP 4: anon key exists =",
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const supabase = createSupabaseBrowserClient();
      console.log("STEP 5: client created");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log("STEP 6: oauth data =", data);
      console.log("STEP 7: oauth error =", error);

      if (error) {
        alert(error.message);
      }
    } catch (err) {
      console.error("STEP 8: unexpected error =", err);
      alert("Unexpected login error. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white"
      >
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
    </main>
  );
}