import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { formatTimestamp, truncateId } from "@/lib/admin/format";

export default async function ImagesPage() {
  const { supabase } = await requireSuperadmin();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return <div className="p-8">{error.message}</div>;
  }

  const imageList = images ?? [];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Images</h1>
        <Link
          href="/admin/images/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          New Image
        </Link>
      </div>
      <div className="text-sm text-gray-400 mb-4">
        Showing {imageList.length} images
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageList.map((image: any) => (
          <Link
            key={image.id}
            href={`/admin/images/${image.id}`}
            className="group rounded-xl border border-gray-800 bg-gray-900/20 overflow-hidden hover:border-gray-700 hover:bg-gray-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <div className="aspect-square w-full bg-gray-950 border-b border-gray-800 flex items-center justify-center">
              {image.url ? (
                <img
                  src={image.url}
                  alt="Uploaded image"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xs text-gray-500">No image</div>
              )}
            </div>
            <div className="p-3 space-y-1">
              <div
                className="font-mono text-xs text-gray-400 truncate"
                title={image.id}
              >
                {truncateId(image.id, 8, 6)}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-400">
                {image.is_public ? (
                  <span className="rounded px-1.5 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                    Public
                  </span>
                ) : (
                  <span className="rounded px-1.5 py-0.5 bg-gray-900 text-gray-500 border border-gray-800">
                    Private
                  </span>
                )}
                {image.is_common_use ? (
                  <span className="rounded px-1.5 py-0.5 bg-indigo-900/40 text-indigo-300 border border-indigo-800">
                    Common use
                  </span>
                ) : null}
              </div>
              <div
                className="text-xs text-gray-500"
                title={image.created_datetime_utc ?? ""}
              >
                {formatTimestamp(image.created_datetime_utc)}
              </div>
            </div>
          </Link>
        ))}

        {imageList.length === 0 && (
          <div className="text-sm text-gray-400 col-span-full">
            No images yet.
          </div>
        )}
      </div>
    </main>
  );
}