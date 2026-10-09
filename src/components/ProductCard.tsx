import { useState } from "react";
import { Link } from "@/lib/router";
import { useCart } from "@/components/CartProvider";
import { formatTenge } from "@/lib/shop";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  status: string;
  stockQty: number;
  isNew: boolean;
  isSale?: boolean;
  categoryName: string;
  image: string;
};

export function ProductCard({
  product,
  labels,
}: {
  product: CardProduct;
  labels: {
    detail: string;
    toCart: string;
    inStock: string;
    outOfStock: string;
    newBadge: string;
    saleBadge: string;
  };
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [broken, setBroken] = useState(false);
  const available = product.status === "in_stock" && product.stockQty > 0;

  function addToCart() {
    if (!available) return;
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[4px] border border-line bg-white transition-all hover:border-graphite hover:shadow-md">
      <Link
        href={`/product/?id=${encodeURIComponent(product.id)}`}
        className="relative block bg-mist"
        aria-label={product.name}
      >
        {product.image && !broken ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <span className="flex aspect-square w-full items-center justify-center bg-mist px-3 text-center text-[15px] font-semibold text-muted">
            {product.name.slice(0, 48)}
          </span>
        )}
        {product.isNew && (
          <span className="absolute left-2 top-2 rounded-[2px] bg-ink px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-gold-soft shadow-sm">
            {labels.newBadge}
          </span>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute right-2 top-2 rounded-[2px] bg-gold px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-white shadow-sm">
            {labels.saleBadge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        <Link href={`/product/?id=${encodeURIComponent(product.id)}`} className="block">
          <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-ink hover:text-gold md:text-[18px]">
            {product.name}
          </h3>
        </Link>
        {product.categoryName && (
          <p className="mt-1 text-[14px] text-muted">{product.categoryName}</p>
        )}

        <p
          className={`mt-2 text-[14px] font-bold uppercase tracking-wide ${
            available ? "text-gold" : "text-muted"
          }`}
        >
          {available ? labels.inStock : labels.outOfStock}
        </p>

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[24px] font-black leading-none text-ink md:text-[27px]">
              {formatTenge(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price ? (
              <span className="text-[15px] font-medium text-muted line-through">
                {formatTenge(product.oldPrice)}
              </span>
            ) : null}
          </div>

          {available ? (
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={addToCart}
                className={`ms-btn h-11 text-[15px] ${added ? "ms-btn-gold" : "ms-btn-primary"}`}
              >
                {added ? "✓ " + labels.toCart : labels.toCart}
              </button>
              <Link
                href={`/product/?id=${encodeURIComponent(product.id)}`}
                className="ms-btn ms-btn-outline h-11 text-[15px]"
              >
                {labels.detail}
              </Link>
            </div>
          ) : (
            <Link
              href={`/product/?id=${encodeURIComponent(product.id)}`}
              className="ms-btn ms-btn-outline mt-3 h-11 w-full text-[15px]"
            >
              {labels.detail}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
