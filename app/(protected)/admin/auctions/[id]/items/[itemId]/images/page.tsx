"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ItemImagesPage({ params }: any) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<any[]>([]);

  // Load existing images
  useEffect(() => {
    async function loadImages() {
      const { data } = await supabase
        .from("item_images")
        .select("*")
        .eq("item_id", params.itemId)
        .order("created_at", { ascending: true });

      setImages(data || []);
    }

    loadImages();
  }, [supabase, params.itemId]);

  async function uploadImage() {
    if (!file) return;

    const filePath = `${params.itemId}/${Date.now()}-${file.name}`;

    const { error: storageError } = await supabase.storage
      .from("item-images")
      .upload(filePath, file);

    if (storageError) {
      console.error(storageError);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("item-images")
      .getPublicUrl(filePath);

    await supabase.from("item_images").insert({
      item_id: params.itemId,
      url: publicUrl.publicUrl,
    });

    router.refresh();
  }

  async function deleteImage(image: any) {
    // Extract storage path from public URL
    const path = image.url.split("/item-images/")[1];

    // Delete from storage
    await supabase.storage.from("item-images").remove([path]);

    // Delete from DB
    await supabase.from("item_images").delete().eq("id", image.id);

    router.refresh();
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Item Images</h1>

      {/* Upload */}
      <div className="space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={uploadImage}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Upload
        </button>
      </div>

      {/* Existing images */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Images</h2>

        <div className="grid grid-cols-2 gap-4">
          {images.map((img) => (
            <div key={img.id} className="space-y-2">
              <img
                src={img.url}
                alt="Item image"
                className="rounded border"
              />

              <button
                onClick={() => deleteImage(img)}
                className="w-full px-3 py-1 bg-red-600 text-white rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-muted-foreground">No images yet.</div>
        )}
      </div>
    </div>
  );
}
