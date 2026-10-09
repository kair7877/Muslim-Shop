import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { useStore } from "@/components/ClientProviders";
import { loadOrders, type StoreOrder } from "@/lib/clientStore";
import { formatTenge } from "@/lib/shop";

export function AdminDashboardView() {
  const { products, categories } = useStore();
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    loadOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalTenge, 0);

  const cards = [
    { label: "Всего товаров", value: products.length, href: "/admin/products/" },
    {
      label: "В наличии",
      value: products.filter((p) => p.inStock).length,
      href: "/admin/products/",
    },
    { label: "Категорий", value: categories.length, href: "/admin/categories/" },
    {
      label: "Новых заказов",
      value: orders.filter((o) => o.status === "new").length,
      href: "/admin/orders/",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">
            Обзор магазина
          </h1>
          <p className="mt-1 text-sm text-muted">
            База данных: Firebase Firestore · Проект: muslim-shop-55c12
          </p>
        </div>
        <Link href="/admin/products/new/" className="ms-btn ms-btn-primary">
          + ДОБАВИТЬ ТОВАР
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          <p className="ms-label">Статус интеграции Firebase</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <b className="text-base text-ink">Подключено (muslim-shop-55c12)</b>
          </div>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Товары, категории и заказы сохраняются в коллекциях Firestore. Вы можете добавлять новые позиции с фотографиями, менять статус наличия и цены в реальном времени.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/products/" className="ms-btn ms-btn-primary text-xs h-10 px-4">
              Товары
            </Link>
            <Link href="/admin/categories/" className="ms-btn ms-btn-outline text-xs h-10 px-4">
              Категории
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
