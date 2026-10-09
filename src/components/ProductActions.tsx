import { useState } from "react";
import { useRouter } from "@/lib/router";
import { useCart } from "@/components/CartProvider";

export function ProductActions({
  product,
  labels,
}: {
  product: { id: string; slug: string; name: string; price: number; image: string };
  labels: {
    toCart: string;
    orderNow: string;
    quantity: string;
    outOfStock: string;
    copyLink: string;
    linkCopied: string;
    share: string;
    added: string;
  };
}) {
  const router = useRouter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  function addToCart() {
    add(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  async function copyLink() {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function share() {
    const url = window.location.href;
    const data = { title: product.name, text: `${product.name}`, url };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* fall back to copy */
      }
    }
    await copyLink();
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[15px] font-extrabold uppercase tracking-[0.06em] text-muted">
          {labels.quantity}
        </span>
        <div className="flex h-12 items-center overflow-hidden rounded-[4px] border border-line">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            className="h-full w-12 text-[22px] font-bold text-ink hover:bg-mist"
            aria-label="−"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={qty}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              setQty(Number.isNaN(parsed) ? 1 : Math.min(99, Math.max(1, Math.round(parsed))));
            }}
            className="h-full w-14 border-x border-line text-center text-[18px] font-bold focus:outline-none"
            aria-label={labels.quantity}
          />
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(99, value + 1))}
            className="h-full w-12 text-[22px] font-bold text-ink hover:bg-mist"
            aria-label="+"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={addToCart}
          className={`ms-btn h-14 text-[16px] ${added ? "ms-btn-gold" : "ms-btn-primary"}`}
        >
          {added ? `✓ ${labels.added}` : labels.toCart}
        </button>
        <button
          type="button"
          onClick={() => {
            add(product, qty);
            router.push("/checkout/");
          }}
          className="ms-btn ms-btn-gold h-14 text-[16px]"
        >
          {labels.orderNow}
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={share} className="ms-btn ms-btn-outline h-12 text-[15px]">
          {labels.share}
        </button>
        <button type="button" onClick={copyLink} className="ms-btn ms-btn-outline h-12 text-[15px]">
          {copied ? `✓ ${labels.linkCopied}` : `🔗 ${labels.copyLink}`}
        </button>
      </div>
    </div>
  );
}
