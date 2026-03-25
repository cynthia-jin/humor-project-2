import { requireSuperadmin } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

async function updateImage(id: string, formData: FormData) {
  "use server";

  const { supabase, profile } = await requireSuperadmin();

  const file = formData.get("image_file");
  let url: string | null = null;
  if (file && file instanceof File) {
    const filePath = `admin-images/${id}/${Date.now()}-${file.name}`;
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
    const existingUrl = formData.get("existing_url")?.toString() || "";
    url = formData.get("url")?.toString() || existingUrl;
  }
  const additional_context =
    formData.get("additional_context")?.toString() || "";
  const image_description =
    formData.get("image_description")?.toString() || "";
  const celebrity_recognition =
    formData.get("celebrity_recognition")?.toString() || "";
  const is_public = formData.get("is_public") === "on";
  const is_common_use = formData.get("is_common_use") === "on";

  const { error } = await supabase
    .from("images")
    .update({
      url,
      additional_context,
      image_description,
      celebrity_recognition,
      is_public,
      is_common_use,
      modified_by_user_id: profile.id,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/images");
}

async function deleteImage(id: string) {
  "use server";

  const { supabase } = await requireSuperadmin();

  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/images");
}

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireSuperadmin();
  const { id } = await params;

  const { data: image, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !image) {
    notFound();
  }

  const updateImageWithId = updateImage.bind(null, id);
  const deleteImageWithId = deleteImage.bind(null, id);

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Image</h1>

      <form action={updateImageWithId} className="space-y-4">
        <input
          type="hidden"
          name="existing_url"
          value={image.url ?? ""}
        />

        <div>
          <label className="block mb-1 font-medium">
            Upload New Image (optional)
          </label>
          <input
            type="file"
            name="image_file"
            accept="image/*"
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Image URL</label>
          <input
            name="url"
            defaultValue={image.url ?? ""}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Additional Context</label>
          <textarea
            name="additional_context"
            defaultValue={image.additional_context ?? ""}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Image Description</label>
          <textarea
            name="image_description"
            defaultValue={image.image_description ?? ""}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Celebrity Recognition</label>
          <textarea
            name="celebrity_recognition"
            defaultValue={image.celebrity_recognition ?? ""}
            className="w-full rounded border p-2"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={!!image.is_public}
          />
          Is Public
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_common_use"
            defaultChecked={!!image.is_common_use}
          />
          Is Common Use
        </label>

        <div className="flex gap-3">
          <button className="rounded bg-black px-4 py-2 text-white">
            Save Changes
          </button>
        </div>
      </form>

      <form action={deleteImageWithId} className="mt-6">
        <button className="rounded bg-red-600 px-4 py-2 text-white">
          Delete Image
        </button>
      </form>
    </main>
  );
}