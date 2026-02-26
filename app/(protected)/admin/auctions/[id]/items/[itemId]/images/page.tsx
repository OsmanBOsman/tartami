"use client";

import { useState, useEffect, DragEvent } from "react";
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
  const [dragActive, setDragActive] = useState(false);

  // Load existing images
  useEffect(() => {
    async function loadImages() {
      const { data } = await supabase
        .from("item_images")
        .select("*")
        .eq("item_id", params.itemId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      setImages(data || []);
    }

    loadImages();
  }, [supabase, params.itemId]);

  async function uploadSelectedFile(selectedFile: File) {
    const filePath = `${params.itemId}/${Date.now()}-${selectedFile.name}`;

    const { error: storageError } = await supabase.storage
      .from("item-images")
      .upload(filePath, selectedFile);

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

  async function uploadImage() {
    if (!file) return;
    await uploadSelectedFile(file);
  }

  async function deleteImage(image: any) {
    const path = image.url.split("/item-images/")[1];

    await supabase.storage.from("item-images").remove([path]);

    await supabase.from("item_images").delete().eq("id", image.id);

    router.refresh();
  }

  async function setPrimary(img: any) {
    await supabase
      .from("item_images")
      .update({ is_primary: false })
      .eq("item_id", params.itemId);

    await supabase
      .from("item_images")
      .update({ is_primary: true })
      .eq("id", img.id);

    router.refresh();
  }

  // Drag & Drop Handlers
  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadSelectedFile(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Item Images</h1>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          dragActive ? "border-primary bg-primary/10" : "border-muted"
        }`}
      >
        <p className="text-sm text-muted-foreground">
          Drag & drop an image here, or click below to upload
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded mt-4"
        />

        <button
          onClick={uploadImage}
          className="mt-3 px-4 py-2 bg-primary text-white rounded-md"
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

              {img.is_primary && (
                <div className="text-xs text-green-700 font-medium">
                  Primary Image
                </div>
              )}

              <button
                onClick={() => setPrimary(img)}
                className="w-full px-3 py-1 bg-green-600 text-white rounded-md text-sm"
              >
                Set Primary
              </button>

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
