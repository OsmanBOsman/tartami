"use client";

import React, { useEffect, useRef, useState } from "react";

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
  const onClose = onCloseAction;
  const setIndex = setIndexAction;

  // --- Fade transition state ---
  const [fadeKey, setFadeKey] = useState(0);

  // --- Pinch-to-zoom state ---
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // --- Track touches ---
  const touchData = useRef({
    initialDistance: 0,
    lastTouchX: 0,
    lastTouchY: 0,
  });

  // --- Reset zoom + trigger fade ---
  function resetZoomAndFade() {
    setScale(1);
    setLastScale(1);
    setPosition({ x: 0, y: 0 });
    setLastPosition({ x: 0, y: 0 });
    setFadeKey((k) => k + 1); // triggers fade animation
  }

  // --- Keyboard navigation ---
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight") {
        const next = (index + 1) % images.length;
        resetZoomAndFade();
        setIndex(next);
      }

      if (e.key === "ArrowLeft") {
        const prev = (index - 1 + images.length) % images.length;
        resetZoomAndFade();
        setIndex(prev);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, onClose, setIndex]);

  // --- Touch handlers (pinch + swipe) ---
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches);
      touchData.current.initialDistance = dist;
    } else if (e.touches.length === 1) {
      touchData.current.lastTouchX = e.touches[0].clientX;
      touchData.current.lastTouchY = e.touches[0].clientY;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches);
      const scaleFactor = dist / touchData.current.initialDistance;
      const newScale = Math.min(Math.max(lastScale * scaleFactor, 1), 4);
      setScale(newScale);
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - touchData.current.lastTouchX;
      const dy = e.touches[0].clientY - touchData.current.lastTouchY;

      setPosition({
        x: lastPosition.x + dx,
        y: lastPosition.y + dy,
      });
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (scale > 1) {
      setLastScale(scale);
      setLastPosition(position);
      return;
    }

    const startX = touchData.current.lastTouchX;
    const endX = e.changedTouches[0].clientX;
    const swipeDistance = startX - endX;

    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        const next = Math.min(index + 1, images.length - 1);
        resetZoomAndFade();
        setIndex(next);
      } else {
        const prev = Math.max(index - 1, 0);
        resetZoomAndFade();
        setIndex(prev);
      }
    }
  }

  function getDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  if (index < 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        key={fadeKey} // triggers fade animation
        ref={imgRef}
        src={images[index].url}
        className="max-h-[90vh] max-w-[90vw] rounded shadow-lg touch-none opacity-0 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${
            position.y / scale
          }px)`,
          transition: "transform 0.05s linear",
        }}
      />

      {images.length > 1 && scale === 1 && (
        <>
          <button
            className="absolute left-6 text-white text-4xl"
            onClick={(e) => {
              e.stopPropagation();
              resetZoomAndFade();
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
              resetZoomAndFade();
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
