import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { doc, getDoc } from "firebase/firestore";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { getFirebaseClientFirestore } from "@/lib/firebaseClient";
import { formatTenge } from "@/lib/shop";
import type { StoreOrder } from "@/lib/clientStore";

export function AdminOrderSingleView() {
  const search = useSearchParams();
  const id = search.get("id") ?? "";
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDoc(doc(getFirebaseClientFirestore(), "orders", id))
      .then((s) => {
        if (s.exists()) {
          setOrder({ id: s.id, ...s.data() } as StoreOrder);
        } else {
          try {
            const stored = window.localStorage.getItem("ms_local_orders_v2");
            if (stored) {
              const list: StoreOrder[] = JSON.parse(stored);
              const found = list.find((o) => o.id === id || o.orderNumber === id);
              if (found) setOrder(found);
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        try {
          const stored = window.localStorage.getItem("ms_local_orders_v2");
          if (stored) {
            const list: StoreOrder[] = JSON.parse(stored);
            const found = list.find((o) => o.id === id || o.orderNumber === id);
            if (found) setOrder(found);
          }
        } catch {
          // ignore
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-12 text-center text-muted">Загрузка данных заказа…</p>;

  if (!order) {
    return (
      <div className="rounded border border-line bg-white p-8 text-center">
        <p className="text-lg font-bold">Заказ «{id}» не найден</p>
        <Link href="/admin/orders/" className="ms-btn ms-btn-primary mt-4">
          Назад к заказам
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-line pb-4">
        <div>
          <Link href="/admin/orders/" className="text-xs font-bold text-gold hover:underline">
            ← Все заказы
          </Link>
          <h1 className="mt-1 text-[24px] font-black uppercase md:text-[28px] text-ink">
            Заказ {order.orderNumber}
          </h1>
          <p className="text-xs text-muted">
            Создан: {new Date(order.createdAt).toLocaleString("ru-RU")}
          </p>
        </div>
        <div className="w-56">
          <OrderStatusSelect orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded border border-line bg-white shadow-xs overflow-hidden">
          <div className="bg-mist px-4 py-3 border-b border-line">
            <h2 className="text-sm font-extrabold uppercase text-muted">Содержимое заказа</h2>
          </div>
          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between items-center p-4">
                <div>
                  <span className="font-bold text-ink">{item.nameSnapshot}</span>
                  <p className="text-xs text-muted">
                    {formatTenge(item.priceTenge)} × {item.qty} шт.
                  </p>
                </div>
                <b className="text-lg text-ink">{formatTenge(item.priceTenge * item.qty)}</b>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-baseline bg-mist/60 p-4 border-t border-line">
            <b className="text-base text-ink">Итоговая сумма</b>
            <b className="text-2xl font-black text-ink">{formatTenge(order.totalTenge)}</b>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-line bg-white p-5 shadow-xs">
            <h2 className="text-sm font-extrabold uppercase text-muted">Данные клиента</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase text-muted">Имя</p>
                <p className="font-bold text-ink text-base">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted">Телефон</p>
                <a
                  href={`tel:${order.phone}`}
                  className="font-bold text-gold text-base hover:underline"
                >
                  {order.phone}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase text-muted">Способ доставки</p>
                <p className="font-semibold text-ink">
                  {order.deliveryMethod === "delivery" ? "Доставка по адресу" : "Самовывоз"}
                </p>
              </div>
              {order.address && (
                <div>
                  <p className="text-xs uppercase text-muted">Адрес доставки</p>
                  <p className="font-medium text-graphite">{order.address}</p>
                </div>
              )}
              {order.comment && (
                <div>
                  <p className="text-xs uppercase text-muted">Комментарий</p>
                  <p className="rounded bg-mist p-2.5 text-xs text-graphite">{order.comment}</p>
                </div>
              )}
            </div>
            <a
              href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="ms-btn ms-btn-primary mt-5 w-full text-xs"
            >
              Написать клиенту в WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
