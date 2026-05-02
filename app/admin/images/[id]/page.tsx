import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import DeleteConfirmButton from "../../DeleteConfirmButton";
import SubmitButton from "../../SubmitButton";
import {
  inputClass,
  checkboxClass,
  buttonSecondaryClass,
} from "@/lib/admin/styles";

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Image</h1>
        <div className="mt-1 text-xs text-gray-500 font-mono break-all">
          ID: {id}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/20 p-4 flex gap-4 items-start">
        {image.url ? (
          <img
            src={image.url}
            alt="Current image"
            className="h-32 w-32 rounded-lg object-cover border border-gray-700 flex-shrink-0"
          />
        ) : (
          <div className="h-32 w-32 rounded-lg border border-gray-700 bg-gray-950 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
            No image
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wider text-gray-500">
            Current image
          </div>
          <div
            className="mt-1 text-sm text-gray-200 truncate"
            title={image.url ?? ""}
          >
            {image.url ?? "No URL set"}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {image.is_public ? (
              <span className="rounded px-1.5 py-0.5 text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                Public
              </span>
            ) : (
              <span className="rounded px-1.5 py-0.5 text-xs bg-gray-900 text-gray-500 border border-gray-800">
                Private
              </span>
            )}
            {image.is_common_use ? (
              <span className="rounded px-1.5 py-0.5 text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-800">
                Common use
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <form action={updateImageWithId} className="space-y-4">
        <input
          type="hidden"
          name="existing_url"
          value={image.url ?? ""}
        />

        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Replace image
          </label>
          <input
            type="file"
            name="image_file"
            accept="image/*"
            className="w-full text-sm text-gray-200 file:mr-3 file:rounded file:border file:border-gray-700 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:text-gray-200 hover:file:bg-gray-800 file:cursor-pointer"
          />
          <div className="mt-1 text-xs text-gray-500">
            Pick a file to upload a replacement. Leave empty to keep the
            current image.
          </div>
        </div>

        <details className="rounded border border-gray-800 bg-gray-900/30 group">
          <summary className="cursor-pointer select-none px-3 py-2 text-sm text-gray-300 hover:text-white list-none flex items-center gap-2">
            <span className="text-gray-500 group-open:rotate-90 inline-block transition-transform">
              ▸
            </span>
            Use external URL instead
            <span className="text-xs text-gray-500 font-normal">
              (advanced)
            </span>
          </summary>
          <div className="px-3 pb-3 pt-1 space-y-1">
            <input
              name="url"
              defaultValue={image.url ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
            <div className="text-xs text-gray-500">
              Paste a URL to point this image at an externally-hosted file.
              Ignored if you also pick a file above.
            </div>
          </div>
        </details>

        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Image Description
          </label>
          <textarea
            name="image_description"
            defaultValue={image.image_description ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Additional Context
          </label>
          <textarea
            name="additional_context"
            defaultValue={image.additional_context ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Celebrity Recognition
          </label>
          <textarea
            name="celebrity_recognition"
            defaultValue={image.celebrity_recognition ?? ""}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-gray-200">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={!!image.is_public}
            className={checkboxClass}
          />
          Is Public
        </label>

        <label className="flex items-center gap-2 text-gray-200">
          <input
            type="checkbox"
            name="is_common_use"
            defaultChecked={!!image.is_common_use}
            className={checkboxClass}
          />
          Is Common Use
        </label>

        <div className="flex gap-3 pt-2">
          <SubmitButton label="Save Changes" pendingLabel="Saving…" />
          <Link href="/admin/images" className={buttonSecondaryClass}>
            Cancel
          </Link>
        </div>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-800">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Danger zone
        </div>
        <form action={deleteImageWithId}>
          <DeleteConfirmButton
            label="Delete Image"
            message="Delete this image? This cannot be undone."
          />
        </form>
      </div>
    </main>
  );
}