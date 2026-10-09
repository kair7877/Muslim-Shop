import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { loadOrders, type StoreOrder } from "@/lib/clientStore";
import { formatTenge } from "@/lib/shop";

export function AdminOrdersView() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    loadOrders()
      .then((res) => {
        setOrders(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">Заказы</h1>
          <p className="text-sm text-muted">Всего оформлено: {orders.length} заказов</p>
        </div>
        <button type="button" onClick={load} className="ms-btn ms-btn-outline h-10 px-4 text-xs">
          Обновить список
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded border border-line bg-white shadow-xs">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="bg-mist text-left text-xs uppercase text-muted">
              <th className="p-3">Номер</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Получение</th>
              <th className="p-3">Сумма</th>
              <th className="p-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  Загрузка заказов…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  Новых заказов пока нет.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-line hover:bg-mist/30">
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/view/?id=${encodeURIComponent(o.id)}`}
                      className="font-bold text-ink hover:text-gold hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-muted">
                      {new Date(o.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </td>
                  <td className="p-3">
                    <b className="text-ink">{o.customerName}</b>
                    <br />
                    <a href={`tel:${o.phone}`} className="text-gold font-semibold text-sm hover:underline">
                      {o.phone}
                    </a>
                  </td>
                  <td className="p-3 text-sm">
                    {o.deliveryMethod === "delivery"
                      ? o.address || o.city || "Курьер по Атырау"
                      : "Самовывоз (Бутик 24)"}
                  </td>
                  <td className="p-3 font-black text-ink">{formatTenge(o.totalTenge)}</td>
                  <td className="p-3">
                    <OrderStatusSelect orderId={o.id} status={o.status} onChanged={load} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
