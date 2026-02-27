"use client";

import { useState } from "react";
import FullScreenImageViewer from "@/components/FullScreenImageViewer";
import ThumbnailStrip from "@/components/ThumbnailStrip";

export default function ImageGallery({ images }: { images: any[] }) {
  const [viewerIndex, setViewerIndex] = useState(-1);

  return (
    <>
      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, i) => (
          <img
            key={img.id}
            src={img.url}
            className="rounded border cursor-pointer"
            onClick={() => setViewerIndex(i)}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <ThumbnailStrip
        images={images}
        activeIndex={viewerIndex >= 0 ? viewerIndex : 0}
        onSelect={(i) => setViewerIndex(i)}
      />

      {/* Full-screen viewer */}
      {viewerIndex >= 0 && (
        <FullScreenImageViewer
          images={images}
          index={viewerIndex}
          setIndex={setViewerIndex}
          onClose={() => setViewerIndex(-1)}
        />
      )}
    </>
  );
}
