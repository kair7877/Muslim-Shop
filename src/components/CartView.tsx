import { Link } from "@/lib/router";
import { useCart } from "@/components/CartProvider";
import { formatTenge } from "@/lib/shop";

export function CartView({
  labels,
}: {
  labels: {
    empty: string;
    emptyHint: string;
    goCatalog: string;
    quantity: string;
    remove: string;
    total: string;
    checkout: string;
    continue: string;
    sum: string;
    title: string;
    note: string;
  };
}) {
  const { items, ready, total, count, setQty, remove } = useCart();

  if (!ready) {
    return <p className="py-16 text-center text-[18px] text-muted">Загрузка корзины…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[4px] border border-line bg-white p-8 text-center md:p-12">
        <p className="text-[22px] font-black text-ink">{labels.empty}</p>
        <p className="mt-2 text-[17px] text-muted">{labels.emptyHint}</p>
        <Link href="/catalog/" className="ms-btn ms-btn-primary mt-6 inline-flex">
          {labels.goCatalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-[4px] border border-line bg-white p-3 md:gap-4 md:p-4"
          >
            <Link href={`/product/?id=${encodeURIComponent(item.id)}`} className="shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-[3px] border border-line object-cover md:h-28 md:w-28"
                />
              ) : (
                <span className="block h-24 w-24 rounded-[3px] border border-line bg-mist md:h-28 md:w-28" />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/product/?id=${encodeURIComponent(item.id)}`}
                className="text-[17px] font-bold leading-snug text-ink hover:underline md:text-[18px]"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-[16px] text-muted">{formatTenge(item.price)} / шт.</p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex h-11 items-center overflow-hidden rounded-[4px] border border-line">
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="h-full w-11 text-[22px] font-bold hover:bg-mist"
                    aria-label="−"
                  >
                    −
                  </button>
                  <span className="w-11 border-x border-line text-center text-[17px] font-bold">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="h-full w-11 text-[22px] font-bold hover:bg-mist"
                    aria-label="+"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-[22px] font-black leading-none text-ink">
                    {formatTenge(item.price * item.qty)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="mt-1 text-[15px] font-semibold text-muted underline hover:text-ink"
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-[188px] lg:self-start">
        <div className="rounded-[4px] border border-line bg-mist p-5">
          <p className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-muted">
            {labels.title}
          </p>
          <div className="mt-4 flex items-baseline justify-between gap-3">
            <span className="text-[17px] font-semibold text-graphite">
              {count} × {labels.sum}
            </span>
            <span className="text-[30px] font-black leading-none text-ink">{formatTenge(total)}</span>
          </div>
          <Link href="/checkout/" className="ms-btn ms-btn-primary mt-5 w-full text-[16px]">
            {labels.checkout}
          </Link>
          <Link href="/catalog/" className="ms-btn ms-btn-outline mt-3 w-full text-[15px]">
            {labels.continue}
          </Link>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{labels.note}</p>
        </div>
      </aside>
    </div>
  );
}
