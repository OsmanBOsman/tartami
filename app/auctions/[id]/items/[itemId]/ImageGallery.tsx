"use client";

import { useState } from "react";
import FullScreenImageViewer from "@/components/FullScreenImageViewer";

export default function ImageGallery({ images }: { images: any[] }) {
  const [viewerIndex, setViewerIndex] = useState(-1);

  return (
    <>
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
