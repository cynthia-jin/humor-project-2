import { requireSuperadmin } from "@/lib/auth";
import { redirect } from "next/navigation";

async function createImage(formData: FormData) {
  "use server";

  const { supabase } = await requireSuperadmin();

  const url = formData.get("url")?.toString() || "";
  const additional_context =
    formData.get("additional_context")?.toString() || "";
  const image_description =
    formData.get("image_description")?.toString() || "";
  const celebrity_recognition =
    formData.get("celebrity_recognition")?.toString() || "";
  const is_public = formData.get("is_public") === "on";
  const is_common_use = formData.get("is_common_use") === "on";

  const { error } = await supabase.from("images").insert({
    url,
    additional_context,
    image_description,
    celebrity_recognition,
    is_public,
    is_common_use,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/images");
}

export default async function NewImagePage() {
  await requireSuperadmin();

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">New Image</h1>

      <form action={createImage} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Image URL</label>
          <input
            name="url"
            required
            className="w-full rounded border p-2"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Additional Context</label>
          <textarea
            name="additional_context"
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Image Description</label>
          <textarea
            name="image_description"
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Celebrity Recognition</label>
          <textarea
            name="celebrity_recognition"
            className="w-full rounded border p-2"
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_public" />
          Is Public
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_common_use" />
          Is Common Use
        </label>

        <button className="rounded bg-black px-4 py-2 text-white">
          Create Image
        </button>
      </form>
    </main>
  );
}