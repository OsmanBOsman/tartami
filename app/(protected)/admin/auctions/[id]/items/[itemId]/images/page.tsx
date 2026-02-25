"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function ItemImagesPage({ params }: any) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [file, setFile] = useState<File | null>(null);

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

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Upload Item Images</h1>

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
  );
}
