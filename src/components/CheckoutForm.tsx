import { useState } from "react";
import { Link, useRouter } from "@/lib/router";
import { useCart } from "@/components/CartProvider";
import { formatTenge } from "@/lib/shop";
import { saveOrder } from "@/lib/clientStore";

export function CheckoutForm({
  labels,
}: {
  labels: {
    name: string;
    phone: string;
    city: string;
    delivery: string;
    pickup: string;
    courier: string;
    address: string;
    addressHint: string;
    comment: string;
    commentHint: string;
    confirm: string;
    total: string;
    cartTitle: string;
    error: string;
    itemsWord: string;
    emptyCart: string;
    goCatalog: string;
  };
}) {
  const router = useRouter();
  const { items, total, count, clear, ready } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    city: "Атырау",
    deliveryMethod: "pickup",
    address: "",
    comment: "",
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (form.customerName.trim().length < 2) {
      setError(labels.name);
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError(labels.phone);
      return;
    }
    if (items.length === 0) {
      setError(labels.emptyCart);
      return;
    }
    setSending(true);
    const now = new Date();
    const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const orderNumber = `MS-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await saveOrder({
        id: orderNumber,
        orderNumber,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || "Атырау",
        deliveryMethod: form.deliveryMethod,
        address: form.address.trim(),
        comment: form.comment.trim(),
        totalTenge: total,
        status: "new",
        createdAt: now.toISOString(),
        items: items.map((item) => ({
          productId: item.id,
          nameSnapshot: item.name,
          priceTenge: item.price,
          qty: item.qty,
        })),
      });
      clear();
      router.push(`/order/?number=${encodeURIComponent(orderNumber)}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : labels.error);
      setSending(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="rounded-[4px] border border-line bg-white p-8 text-center">
        <p className="text-[21px] font-black text-ink">{labels.emptyCart}</p>
        <Link href="/catalog/" className="ms-btn ms-btn-primary mt-5 inline-flex">
          {labels.goCatalog}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-[4px] border border-line bg-white p-5 md:p-6">
        <div className="grid gap-4">
          <div>
            <label className="ms-label" htmlFor="customerName">
              {labels.name} *
            </label>
            <input
              id="customerName"
              className="ms-field"
              value={form.customerName}
              onChange={(event) => update("customerName", event.target.value)}
              autoComplete="name"
              placeholder="Ваше имя"
              required
            />
          </div>

          <div>
            <label className="ms-label" htmlFor="phone">
              {labels.phone} *
            </label>
            <input
              id="phone"
              className="ms-field"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+7 7__ ___ __ __"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </div>

          <div>
            <label className="ms-label" htmlFor="city">
              {labels.city}
            </label>
            <input
              id="city"
              className="ms-field"
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
            />
          </div>

          <div>
            <p className="ms-label">{labels.delivery}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => update("deliveryMethod", "pickup")}
                className={`rounded-[4px] border p-4 text-left text-[16px] font-semibold transition-colors ${
                  form.deliveryMethod === "pickup"
                    ? "border-ink bg-mist text-ink"
                    : "border-line bg-white text-graphite"
                }`}
              >
                {labels.pickup}
              </button>
              <button
                type="button"
                onClick={() => update("deliveryMethod", "delivery")}
                className={`rounded-[4px] border p-4 text-left text-[16px] font-semibold transition-colors ${
                  form.deliveryMethod === "delivery"
                    ? "border-ink bg-mist text-ink"
                    : "border-line bg-white text-graphite"
                }`}
              >
                {labels.courier}
              </button>
            </div>
          </div>

          {form.deliveryMethod === "delivery" && (
            <div>
              <label className="ms-label" htmlFor="address">
                {labels.address}
              </label>
              <input
                id="address"
                className="ms-field"
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder={labels.addressHint}
                autoComplete="street-address"
              />
            </div>
          )}

          <div>
            <label className="ms-label" htmlFor="comment">
              {labels.comment}
            </label>
            <textarea
              id="comment"
              className="ms-field min-h-[110px]"
              value={form.comment}
              onChange={(event) => update("comment", event.target.value)}
              placeholder={labels.commentHint}
            />
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-[188px] lg:self-start">
        <div className="rounded-[4px] border border-line bg-mist p-5">
          <p className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-muted">
            {labels.cartTitle}
          </p>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <span className="text-[16px] font-semibold text-graphite">
                  {item.name} <span className="text-muted">× {item.qty}</span>
                </span>
                <span className="whitespace-nowrap text-[16px] font-bold text-ink">
                  {formatTenge(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
            <span className="text-[17px] font-semibold text-graphite">
              {labels.total} ({count} {labels.itemsWord})
            </span>
            <span className="text-[30px] font-black leading-none text-ink">{formatTenge(total)}</span>
          </div>

          {error && (
            <p className="mt-4 rounded-[4px] border border-line bg-white px-4 py-3 text-[16px] font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="ms-btn ms-btn-primary mt-5 w-full text-[16px] disabled:opacity-60"
          >
            {sending ? "Отправка заказа…" : labels.confirm}
          </button>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            После оформления заказа наш менеджер свяжется с вами для подтверждения и уточнения доставки.
          </p>
        </div>
      </aside>
    </form>
  );
}
