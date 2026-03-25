import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireSuperadmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // After OAuth, there can be a short window where the session cookie exists
  // but the `profiles` row has not been created/updated yet (DB triggers, etc.).
  // A small retry avoids the "click login twice" symptom.
  let profile: { id: string; is_superadmin: boolean } | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, is_superadmin")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      profile = data as { id: string; is_superadmin: boolean };
      break;
    }

    if (error) {
      lastError = new Error(error.message);
    }

    // Simple backoff between retries.
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }

  if (!profile?.is_superadmin) {
    // If profiles row still isn't ready, fall back to login.
    redirect("/login");
  }

  return { supabase, user, profile };
}