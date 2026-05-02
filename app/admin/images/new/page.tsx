import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubmitButton from "../../SubmitButton";
import {
  inputClass,
  checkboxClass,
  buttonSecondaryClass,
} from "@/lib/admin/styles";

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Image</h1>
        <p className="mt-1 text-sm text-gray-400">
          Upload a file or paste an external URL.
        </p>
      </div>

      <form action={createImage} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Upload image
          </label>
          <input
            type="file"
            name="image_file"
            accept="image/*"
            className="w-full text-sm text-gray-200 file:mr-3 file:rounded file:border file:border-gray-700 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:text-gray-200 hover:file:bg-gray-800 file:cursor-pointer"
          />
          <div className="mt-1 text-xs text-gray-500">
            The file will be uploaded to Storage and the public URL saved to
            this image.
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
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Additional Context
          </label>
          <textarea
            name="additional_context"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Celebrity Recognition
          </label>
          <textarea
            name="celebrity_recognition"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-gray-200">
          <input type="checkbox" name="is_public" className={checkboxClass} />
          Is Public
        </label>

        <label className="flex items-center gap-2 text-gray-200">
          <input
            type="checkbox"
            name="is_common_use"
            className={checkboxClass}
          />
          Is Common Use
        </label>

        <div className="flex gap-3 pt-2">
          <SubmitButton label="Create Image" pendingLabel="Creating…" />
          <Link href="/admin/images" className={buttonSecondaryClass}>
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}