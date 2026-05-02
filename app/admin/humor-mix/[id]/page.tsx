import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import SubmitButton from "../../SubmitButton";
import { inputClass, buttonSecondaryClass } from "@/lib/admin/styles";

export default async function EditHumorMixPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireSuperadmin();

  const [{ data: mix, error: mixError }, { data: flavors, error: flavorsError }] =
    await Promise.all([
      supabase
        .from("humor_flavor_mix")
        .select("id, humor_flavor_id, caption_count")
        .eq("id", params.id)
        .single(),
      supabase.from("humor_flavors").select("id, slug").order("id", { ascending: true }),
    ]);

  if (mixError || !mix) return notFound();
  if (flavorsError) return <div className="p-8">{flavorsError.message}</div>;

  async function updateMix(formData: FormData) {
    "use server";

    const { supabase, profile } = await requireSuperadmin();

    const humorFlavorId = formData.get("humor_flavor_id")?.toString() ?? "";
    const captionCountRaw = formData.get("caption_count")?.toString() ?? "";
    const captionCount = Number(captionCountRaw);

    if (!humorFlavorId) {
      throw new Error("humor_flavor_id is required.");
    }
    if (!Number.isFinite(captionCount)) {
      throw new Error("caption_count must be a number.");
    }

    const payload = {
      humor_flavor_id: humorFlavorId,
      caption_count: captionCount,
      modified_by_user_id: profile.id,
    };

    const { error } = await supabase
      .from("humor_flavor_mix")
      .update(payload)
      .eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    redirect("/admin/humor-mix");
  }

  return (
    <main className="p-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Edit Humor Mix</h1>
          <Link
            href="/admin/humor-mix"
            className="underline text-indigo-400 hover:text-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            Back to list
          </Link>
        </div>
        <div className="mt-1 text-xs text-gray-500 font-mono break-all">
          ID: {params.id}
        </div>
      </div>

      <form action={updateMix} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-200">Humor Flavor</label>
          <select
            name="humor_flavor_id"
            defaultValue={String(mix.humor_flavor_id)}
            className={inputClass}
            required
          >
            {flavors?.map((f) => (
              <option key={String(f.id)} value={String(f.id)}>
                {f.slug}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-200">Caption Count</label>
          <input
            type="number"
            name="caption_count"
            defaultValue={Number(mix.caption_count)}
            className={inputClass}
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton label="Save" pendingLabel="Saving…" />
          <Link href="/admin/humor-mix" className={buttonSecondaryClass}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

