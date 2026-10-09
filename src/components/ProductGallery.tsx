import { useState } from "react";

export function ProductGallery({
  images,
  name,
}: {
  images: { src: string; alt: string }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState(false);
  const current = images[active] || images[0];
  const hasImage = Boolean(current?.src) && !broken;

  return (
    <div>
      <div className="overflow-hidden rounded-[4px] border border-line bg-mist aspect-[9/16] max-h-[620px] flex items-center justify-center">
        {hasImage ? (
          <img
            src={current.src}
            alt={current.alt || name}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-6 text-center text-[18px] font-semibold text-muted">
            {name}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => {
                setActive(index);
                setBroken(false);
              }}
              className={`overflow-hidden rounded-[4px] border transition-colors ${
                index === active ? "border-ink ring-2 ring-gold" : "border-line hover:border-graphite"
              }`}
              aria-label={`${name} — ${index + 1}`}
            >
              <img
                src={image.src}
                alt=""
                className="aspect-square w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.opacity = "0.3";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
