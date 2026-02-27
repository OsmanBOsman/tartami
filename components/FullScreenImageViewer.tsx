"use client";

import React, { useEffect, useRef, useState } from "react";
import ImageGridModal from "./ImageGridModal";

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

  // --- Grid modal state ---
  const [showGrid, setShowGrid] = useState(false);

  // --- Pinch + double-tap zoom state ---
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // --- Double-tap detection ---
  const lastTapRef = useRef(0);

  // --- Touch tracking ---
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
    setFadeKey((k) => k + 1);
  }

  // --- Keyboard navigation ---
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight") {
        resetZoomAndFade();
        setIndex((index + 1) % images.length);
      }

      if (e.key === "ArrowLeft") {
        resetZoomAndFade();
        setIndex((index - 1 + images.length) % images.length);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, images.length, onClose, setIndex]);

  // --- Preload next/previous images ---
  useEffect(() => {
    const preload = (url: string) => {
      const img = new Image();
      img.src = url;
    };

    if (images[index + 1]) preload(images[index + 1].url);
    if (images[index - 1]) preload(images[index - 1].url);
  }, [index, images]);

  // --- Double-tap to zoom ---
  function handleDoubleTap(e: React.TouchEvent) {
    const now = Date.now();
    const timeSince = now - lastTapRef.current;

    if (timeSince < 300) {
      if (scale === 1) {
        const tapX = e.touches[0].clientX - window.innerWidth / 2;
        const tapY = e.touches[0].clientY - window.innerHeight / 2;

        setScale(2);
        setLastScale(2);
        setPosition({ x: tapX, y: tapY });
        setLastPosition({ x: tapX, y: tapY });
      } else {
        resetZoomAndFade();
      }
    }

    lastTapRef.current = now;
  }

  // --- Touch handlers (pinch + swipe + double-tap) ---
  function handleTouchStart(e: React.TouchEvent) {
    handleDoubleTap(e);

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
        resetZoomAndFade();
        setIndex(Math.min(index + 1, images.length - 1));
      } else {
        resetZoomAndFade();
        setIndex(Math.max(index - 1, 0));
      }
    }
  }

  function getDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  if (index < 0) return null;

  return (
    <>
      {showGrid && (
        <ImageGridModal
          images={images}
          onSelectAction={(i) => {
            resetZoomAndFade();
            setIndex(i);
            setShowGrid(false);
          }}
          onCloseAction={() => setShowGrid(false)}
        />
      )}

      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image counter */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
          {index + 1} / {images.length}
        </div>

        {/* View All button */}
        <button
          className="absolute top-6 right-6 text-white text-sm bg-black/40 px-3 py-1 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            setShowGrid(true);
          }}
        >
          View All
        </button>

        <img
          key={fadeKey}
          ref={imgRef}
          src={images[index].url}
          className="max-h-[90vh] max-w-[90vw] rounded shadow-lg touch-none opacity-0 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${
              position.y / scale
            }px)`,
            transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {images.length > 1 && scale === 1 && (
          <>
            <button
              className="absolute left-6 text-white text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                resetZoomAndFade();
                setIndex((index - 1 + images.length) % images.length);
              }}
            >
              ‹
            </button>

            <button
              className="absolute right-6 text-white text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                resetZoomAndFade();
                setIndex((index + 1) % images.length);
              }}
            >
              ›
            </button>
          </>
        )}
      </div>
    </>
  );
}
