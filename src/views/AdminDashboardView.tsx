import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { useStore } from "@/components/ClientProviders";
import { loadOrders, type StoreOrder } from "@/lib/clientStore";
import { getVisitorSessions, type VisitorSession } from "@/lib/analytics";
import { formatTenge } from "@/lib/shop";

export function AdminDashboardView() {
  const { products, categories } = useStore();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [sessions, setSessions] = useState<VisitorSession[]>([]);

  useEffect(() => {
    loadOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
    getVisitorSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalTenge, 0);

  const totalProductViews = sessions.reduce(
    (acc, s) => acc + (s.viewedProducts?.length || 0),
    0
  );

  const cards = [
    { label: "Всего товаров", value: products.length, href: "/admin/products/" },
    {
      label: "В наличии",
      value: products.filter((p) => p.inStock).length,
      href: "/admin/products/",
    },
    { label: "Посетителей (клиентов)", value: sessions.length, href: "/admin/analytics/" },
    {
      label: "Новых заказов",
      value: orders.filter((o) => o.status === "new").length,
      href: "/admin/orders/",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">
            Обзор магазина
          </h1>
          <p className="mt-1 text-sm text-muted">
            База данных: Firebase Firestore · Проект: muslim-shop-55c12
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics/" className="ms-btn ms-btn-outline text-sm">
            📊 Статистика клиентов
          </Link>
          <Link href="/admin/products/new/" className="ms-btn ms-btn-primary text-sm">
            + ДОБАВИТЬ ТОВАР
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded border border-line bg-white p-5 shadow-xs hover:border-graphite transition-colors"
          >
            <p className="ms-label text-xs">{c.label}</p>
            <p className="mt-2 text-[32px] font-black text-ink">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-line bg-white p-6 shadow-xs">
          <p className="ms-label">Общая сумма оформленных заказов</p>
          <p className="mt-2 text-[36px] font-black text-ink">{formatTenge(revenue)}</p>
          <p className="mt-2 text-sm text-muted">
            Всего заказов в системе: {orders.length}
          </p>
          <Link href="/admin/orders/" className="ms-btn ms-btn-outline mt-4 text-sm">
            Перейти к заказам →
          </Link>
        </div>

        <div className="rounded border border-line bg-white p-6 shadow-xs">
          <p className="ms-label">Активность покупателей</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-[36px] font-black text-gold">{totalProductViews}</span>
            <span className="text-sm font-semibold text-graphite">просмотров карточек товаров</span>
          </div>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Отслеживайте в реальном времени, из каких городов заходят покупатели (Атырау, Алматы, Астана) и какие конкретно позиции они изучают.
          </p>
          <Link href="/admin/analytics/" className="ms-btn ms-btn-primary mt-4 text-sm">
            Открыть журнал посещений →
          </Link>
        </div>
      </div>

      {/* Recent Visitors Teaser */}
      {sessions.length > 0 && (
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <div className="flex justify-between items-center border-b border-line pb-3">
            <h2 className="text-base font-extrabold uppercase text-ink">
              Последние действия клиентов
            </h2>
            <Link href="/admin/analytics/" className="text-xs font-bold text-gold hover:underline">
              Вся аналитика →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line text-sm">
            {sessions.slice(0, 5).map((s) => (
              <div key={s.id} className="py-2.5 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold bg-mist px-2 py-1 rounded">
                    📍 {s.city || "Атырау"}
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(s.lastActive || s.visitedAt).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-graphite font-medium">({s.device})</span>
                </div>
                <div className="text-xs font-semibold text-ink">
                  {s.viewedProducts && s.viewedProducts.length > 0 ? (
                    <span>
                      Смотрел: <b className="text-gold">{s.viewedProducts[0].name}</b>
                      {s.viewedProducts.length > 1 && ` (+ ещё ${s.viewedProducts.length - 1})`}
                    </span>
                  ) : (
                    <span className="text-muted italic">Просмотр витрины</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
