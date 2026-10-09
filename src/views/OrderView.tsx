import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage } from "@/components/ClientProviders";
import { getFirebaseClientFirestore } from "@/lib/firebaseClient";
import { formatTenge, orderStatusLabel } from "@/lib/shop";
import type { StoreOrder } from "@/lib/clientStore";

export function OrderView() {
  const params = useSearchParams();
  const number = params.get("number") ?? "";
  const { dict } = useLanguage();
  const [order, setOrder] = useState<StoreOrder | null>(null);

  useEffect(() => {
    if (!number) return;
    // Check Firestore
    getDoc(doc(getFirebaseClientFirestore(), "orders", number))
      .then((snap) => {
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() } as StoreOrder);
        } else {
          // Check local cache
          try {
            const stored = window.localStorage.getItem("ms_local_orders_v2");
            if (stored) {
              const list: StoreOrder[] = JSON.parse(stored);
              const found = list.find((o) => o.id === number || o.orderNumber === number);
              if (found) setOrder(found);
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback to local storage
        try {
          const stored = window.localStorage.getItem("ms_local_orders_v2");
          if (stored) {
            const list: StoreOrder[] = JSON.parse(stored);
            const found = list.find((o) => o.id === number || o.orderNumber === number);
            if (found) setOrder(found);
          }
        } catch {
          // ignore
        }
      });
  }, [number]);

  return (
    <div className="ms-container py-10 md:py-14">
      <div className="mx-auto max-w-2xl rounded border border-line bg-white p-6 md:p-9 shadow-xs">
        <span className="inline-block rounded bg-ink px-3.5 py-1.5 text-[14px] font-extrabold uppercase text-gold-soft">
          ✓ {dict.orderSuccess}
        </span>
        <h1 className="mt-4 text-[26px] font-black md:text-[34px]">
          {dict.orderNumberLabel}: {number || "MS-NEW"}
        </h1>
        <p className="mt-3 text-[17px] text-graphite leading-relaxed">
          {dict.orderSuccessHint}
        </p>

        {order && (
          <div className="mt-6 overflow-hidden rounded border border-line">
            <div className="flex justify-between bg-mist px-4 py-3 text-sm">
              <span className="font-bold text-ink">{order.customerName}</span>
              <span className="text-muted font-medium">{order.phone}</span>
            </div>
            <ul className="divide-y divide-line">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between gap-3 px-4 py-3 text-sm">
                  <span>
                    {item.nameSnapshot} <span className="text-muted">× {item.qty}</span>
                  </span>
                  <b>{formatTenge(item.priceTenge * item.qty)}</b>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-line bg-mist/30 px-4 py-4">
              <span className="font-bold">
                {dict.total} · Статус:{" "}
                <span className="text-gold font-extrabold">{orderStatusLabel(order.status)}</span>
              </span>
              <span className="text-[24px] font-black text-ink">{formatTenge(order.totalTenge)}</span>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/" className="ms-btn ms-btn-primary w-full">
            {dict.backHome}
          </Link>
          <Link href="/catalog/" className="ms-btn ms-btn-outline w-full">
            {dict.catalog}
          </Link>
        </div>
      </div>
    </div>
  );
}
