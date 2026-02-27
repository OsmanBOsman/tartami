"use client";

import React, { useEffect } from "react";

export default function FullScreenImageViewer({
  images,
  index,
  onCloseAction,
  setIndexAction,
}: {
  images: { url: string }[];
  index: number;
  onCloseAction: () => void;
  setIndexAction: (i: number) => void;
}) {
  // Local aliases for readability
  const onClose = onCloseAction;
  const setIndex = setIndexAction;

  // --- Keyboard navigation (ESC + arrows) ---
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight") {
        const next = (index + 1) % images.length;
        setIndex(next);
      }

      if (e.key === "ArrowLeft") {
        const prev = (index - 1 + images.length) % images.length;
        setIndex(prev);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, onClose, setIndex]);

  // --- Swipe gesture support ---
  let touchStartX = 0;
  let touchEndX = 0;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX = e.changedTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) < 50) return;

    if (swipeDistance > 0) {
      const next = Math.min(index + 1, images.length - 1);
      setIndex(next);
    } else {
      const prev = Math.max(index - 1, 0);
      setIndex(prev);
    }
  }

  if (index < 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
              const prev = (index - 1 + images.length) % images.length;
              setIndex(prev);
            }}
          >
            ‹
          </button>

          <button
            className="absolute right-6 text-white text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              const next = (index + 1) % images.length;
              setIndex(next);
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
