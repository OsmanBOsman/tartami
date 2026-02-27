"use client";

export default function ThumbnailStrip({
  images,
  activeIndex,
  onSelectAction,
}: {
  images: { url: string }[];
  activeIndex: number;
  onSelectAction: (i: number) => void;
}) {
  const handleSelect = (i: number) => onSelectAction(i);

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url}
          onClick={() => handleSelect(i)}
          className={`h-16 w-16 object-cover rounded border cursor-pointer transition
            ${
              activeIndex === i
                ? "ring-2 ring-primary"
                : "opacity-70 hover:opacity-100"
            }
          `}
        />
      ))}
    </div>
  );
}
