"use client";

import React, { useState, useEffect, DragEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import FullScreenImageViewer from "@/components/FullScreenImageViewer";
import ThumbnailStrip from "@/components/ThumbnailStrip";
import ZoomImage from "@/components/ZoomImage";

export default function ItemImagesPage() {
  const router = useRouter();
  const routeParams = useParams();

  const id = routeParams.id as string;
  const itemId = routeParams.itemId as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [viewerIndex, setViewerIndex] = useState(-1);

  // Load existing images
  useEffect(() => {
    async function loadImages() {
      const { data } = await supabase
        .from("item_images")
        .select("*")
        .eq("item_id", itemId)
        .order("position", { ascending: true });

      setImages(data || []);
    }

    loadImages();
  }, [supabase, itemId]);

  // --- CLIENT-SIDE COMPRESSION + WEBP ---
  async function compressToWebP(inputFile: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 1600;

        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(inputFile);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(inputFile);

            const webpFile = new File(
              [blob],
              inputFile.name.replace(/\.\w+$/, ".webp"),
              { type: "image/webp" }
            );

            resolve(webpFile);
          },
          "image/webp",
          0.8
        );
      };

      reader.readAsDataURL(inputFile);
    });
  }

  // --- UPLOAD ---
  async function uploadSelectedFile(selectedFile: File) {
    const optimized = await compressToWebP(selectedFile);

    const filePath = `items/${itemId}/${Date.now()}-${optimized.name}`;

    const { error: storageError } = await supabase.storage
      .from("item-images")
      .upload(filePath, optimized);

    if (storageError) {
      console.error(storageError);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("item-images").getPublicUrl(filePath);

    const nextPosition = images.length;

    await supabase.from("item_images").insert({
      item_id: itemId,
      url: publicUrl,
      position: nextPosition,
    });

    router.refresh();
  }

  async function uploadImage() {
    if (!file) return;
    await uploadSelectedFile(file);
  }

  // --- DELETE ---
  async function deleteImage(image: any) {
    const path = image.url.split("/object/public/")[1];

    await supabase.storage.from("item-images").remove([path]);

    await supabase.from("item_images").delete().eq("id", image.id);

    router.refresh();
  }

  // --- SET PRIMARY ---
  async function setPrimary(img: any) {
    await supabase
      .from("auction_items")
      .update({ primary_image_url: img.url })
      .eq("id", itemId);

    router.refresh();
  }

  // --- REORDER ---
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  async function handleDrop(index: number) {
    if (dragIndex === null) return;

    const updated = [...images];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);

    const normalized = updated.map((img, i) => ({
      ...img,
      position: i,
    }));

    setImages(normalized);

    await Promise.all(
      normalized.map((img) =>
        supabase.from("item_images").update({ position: img.position }).eq("id", img.id)
      )
    );

    setDragIndex(null);
  }

  // --- DRAG & DROP UPLOAD ---
  function handleDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  async function handleDropUpload(e: DragEvent) {
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

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDropUpload}
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

      {/* Existing Images */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Images</h2>

        <div className="grid grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="space-y-2 cursor-move"
            >
              <div onClick={() => setViewerIndex(index)}>
                <ZoomImage src={img.url} alt="Item image" zoom={2} />
              </div>

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

      {/* Thumbnail strip */}
      {images.length > 0 && (
        <ThumbnailStrip
          images={images}
          activeIndex={viewerIndex >= 0 ? viewerIndex : 0}
          onSelectAction={(i) => setViewerIndex(i)}
        />
      )}

      {/* Full-screen viewer */}
      {viewerIndex >= 0 && (
        <FullScreenImageViewer
          images={images}
          index={viewerIndex}
          setIndexAction={setViewerIndex}
          onCloseAction={() => setViewerIndex(-1)}
        />
      )}
    </div>
  );
}
