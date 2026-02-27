"use client";

import React, { useEffect } from "react";

export default function FullScreenImageViewer({
  images,
  index,
  onClose,
  setIndex,
}: {
  images: { url: string }[];
  index: number;
  onClose: () => void;
  setIndex: (i: number) => void;
}) {
  // Close on ESC + arrow navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, onClose, setIndex]);

  if (index < 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={images[index].url}
        className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <>
          <button
            className="absolute left-6 text-white text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index - 1 + images.length) % images.length);
            }}
          >
            ‹
          </button>

          <button
            className="absolute right-6 text-white text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index + 1) % images.length);
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
