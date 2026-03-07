import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";

export default async function ImagesPage() {
  const { supabase } = await requireSuperadmin();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Images</h1>
        <Link
          href="/admin/images/new"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          New Image
        </Link>
      </div>

      <div className="space-y-4">
        {images?.map((image: any) => (
          <div
            key={image.id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div className="flex items-center gap-4">
              {image.url ? (
                <img
                  src={image.url}
                  alt="Uploaded image"
                  className="h-20 w-20 rounded-lg object-cover border"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border text-xs text-gray-500">
                  No image
                </div>
              )}

              <div>
                <div className="font-medium break-all">{image.id}</div>
                <div className="text-sm text-gray-500 break-all">
                  {image.url ?? "No URL"}
                </div>
                <div className="text-sm text-gray-500">
                  Public: {image.is_public ? "Yes" : "No"} · Common use:{" "}
                  {image.is_common_use ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/admin/images/${image.id}`} className="underline">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}