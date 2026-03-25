import { requireSuperadmin } from "@/lib/auth";
import { redirect } from "next/navigation";

async function createImage(formData: FormData) {
  "use server";

  const { supabase, profile } = await requireSuperadmin();

  const file = formData.get("image_file");
  let url: string | null = null;
  if (file && file instanceof File) {
    const filePath = `admin-images/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        contentType: file.type ?? undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicData } = supabase.storage
      .from("images")
      .getPublicUrl(uploadData.path);

    url = publicData.publicUrl;
  } else {
    url = formData.get("url")?.toString() || "";
  }

  if (!url) {
    throw new Error("Provide either an uploaded image file or a URL.");
  }

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
    created_by_user_id: profile.id,
    modified_by_user_id: profile.id,
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
          <label className="block mb-1 font-medium">Upload Image (optional)</label>
          <input
            type="file"
            name="image_file"
            accept="image/*"
            className="w-full"
          />
          <div className="mt-1 text-xs text-gray-500">
            If provided, the public URL from Storage will be saved to `images.url`.
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Image URL</label>
          <input
            name="url"
            placeholder="https://..."
            className="w-full rounded border p-2"
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