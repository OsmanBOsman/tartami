"use client";

import { useState } from "react";
import FullScreenImageViewer from "@/components/FullScreenImageViewer";
import ThumbnailStrip from "@/components/ThumbnailStrip";
import ZoomImage from "@/components/ZoomImage";

export default function ImageGallery({ images }: { images: any[] }) {
  const [viewerIndex, setViewerIndex] = useState(-1);

  return (
    <>
      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, i) => (
          <div key={img.id} onClick={() => setViewerIndex(i)}>
            <ZoomImage src={img.url} alt="Item image" zoom={2} />
          </div>
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
