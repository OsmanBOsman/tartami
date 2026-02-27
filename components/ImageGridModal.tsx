"use client";

export default function ImageGridModal({
  images,
  onSelectAction,
  onCloseAction,
}: {
  images: { url: string }[];
  onSelectAction: (i: number) => void;
  onCloseAction: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center animate-fadeIn"
      onClick={onCloseAction}
    >
      <div
        className="grid grid-cols-3 gap-3 p-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            className="w-28 h-28 object-cover rounded cursor-pointer hover:opacity-80 transition"
            onClick={() => onSelectAction(i)}
          />
        ))}
      </div>
    </div>
  );
}
