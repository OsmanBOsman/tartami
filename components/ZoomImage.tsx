"use client";

import { useRef, useState } from "react";

export default function ZoomImage({
  src,
  alt,
  zoom = 2,
}: {
  src: string;
  alt?: string;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [backgroundPos, setBackgroundPos] = useState("50% 50%");
  const [isZoomed, setIsZoomed] = useState(false);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setBackgroundPos(`${x}% ${y}%`);
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded border cursor-zoom-in"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: isZoomed ? `${zoom * 100}%` : "100%",
        backgroundPosition: backgroundPos,
        transition: "background-size 0.2s ease",
      }}
    >
      {/* Invisible img keeps layout stable */}
      <img src={src} alt={alt} className="opacity-0 w-full h-full" />
    </div>
  );
}
