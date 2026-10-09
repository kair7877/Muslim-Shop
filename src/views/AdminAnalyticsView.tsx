import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { getVisitorSessions, type VisitorSession } from "@/lib/analytics";

export function AdminAnalyticsView() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getVisitorSessions()
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Aggregated stats
  const cityCount = new Map<string, number>();
  const productViewsMap = new Map<string, { id: string; name: string; count: number }>();
  let totalProductViews = 0;

  sessions.forEach((s) => {
    const c = s.city || "Не определен";
    cityCount.set(c, (cityCount.get(c) ?? 0) + 1);

    s.viewedProducts?.forEach((p) => {
      totalProductViews++;
      const existing = productViewsMap.get(p.id) || { id: p.id, name: p.name, count: 0 };
      existing.count++;
      productViewsMap.set(p.id, existing);
    });
  });

  const topProducts = Array.from(productViewsMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topCities = Array.from(cityCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">
            Статистика и аналитика
          </h1>
          <p className="mt-1 text-sm text-muted">
            Посетители магазина: время входа, города и просмотренные товары
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="ms-btn ms-btn-outline h-10 px-4 text-xs font-bold"
        >
          Обновить данные
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label text-xs">Всего зафиксировано клиентов</p>
          <p className="mt-2 text-[32px] font-black text-ink">{sessions.length}</p>
        </div>
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label text-xs">Просмотров карточек товаров</p>
          <p className="mt-2 text-[32px] font-black text-gold">{totalProductViews}</p>
        </div>
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label text-xs">География (городов)</p>
          <p className="mt-2 text-[32px] font-black text-ink">{cityCount.size}</p>
        </div>
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label text-xs">Основной регион</p>
          <p className="mt-2 text-[20px] font-black text-ink truncate">
            {topCities[0] ? topCities[0][0] : "Атырау"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Cities */}
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <h2 className="text-base font-extrabold uppercase text-ink border-b border-line pb-3">
            Города покупателей
          </h2>
          <div className="mt-4 space-y-3">
            {topCities.length === 0 ? (
              <p className="text-sm text-muted py-4">Данные собираются...</p>
            ) : (
              topCities.map(([city, count]) => {
                const percent = Math.round((count / Math.max(1, sessions.length)) * 100);
                return (
                  <div key={city}>
                    <div className="flex justify-between text-sm font-bold text-graphite mb-1">
                      <span>{city}</span>
                      <span className="text-muted">
                        {count} чел. ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-mist h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gold h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Viewed Products */}
        <div className="rounded border border-line bg-white p-5 shadow-xs lg:col-span-2">
          <h2 className="text-base font-extrabold uppercase text-ink border-b border-line pb-3">
            Самые просматриваемые товары
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase text-muted">
                  <th className="pb-2 font-bold">Товар</th>
                  <th className="pb-2 text-right font-bold">Просмотров</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-muted">
                      Пока нет зафиксированных просмотров товаров.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-mist/30">
                      <td className="py-2.5 pr-2 font-semibold text-ink flex items-center gap-2">
                        <span className="text-xs text-muted w-4 font-bold">{idx + 1}.</span>
                        <Link
                          href={`/product/?id=${encodeURIComponent(p.id)}`}
                          className="hover:text-gold hover:underline"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-2.5 text-right font-black text-ink">{p.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Visitor Feed */}
      <div className="rounded border border-line bg-white shadow-xs overflow-hidden">
        <div className="bg-mist px-5 py-4 border-b border-line flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold uppercase text-ink">
              Журнал посетителей в реальном времени
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Кто заходил на сайт, когда и какие конкретно товары просматривал
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            В сети / Онлайн
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="bg-mist/60 text-xs uppercase text-muted border-b border-line">
                <th className="p-3.5">Время захода</th>
                <th className="p-3.5">Город / Страна</th>
                <th className="p-3.5">Устройство</th>
                <th className="p-3.5">Что смотрел покупатель</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">
                    Загрузка журнала посетителей…
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted">
                    История активности пока пуста.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-mist/30 transition-colors">
                    <td className="p-3.5 whitespace-nowrap">
                      <b className="text-ink">
                        {new Date(s.lastActive || s.visitedAt).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </b>
                      <p className="text-xs text-muted">
                        {new Date(s.visitedAt).toLocaleDateString("ru-RU")}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 font-bold text-ink">
                        📍 {s.city || "Атырау"}
                      </span>
                      <p className="text-xs text-muted">{s.country || "Казахстан"}</p>
                    </td>
                    <td className="p-3.5 text-xs font-semibold text-graphite">
                      {s.device || "Мобильный"}
                    </td>
                    <td className="p-3.5">
                      {s.viewedProducts && s.viewedProducts.length > 0 ? (
                        <div className="space-y-1">
                          {s.viewedProducts.slice(0, 4).map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2 text-xs">
                              <span className="text-gold font-bold">👁</span>
                              <Link
                                href={`/product/?id=${encodeURIComponent(p.id)}`}
                                className="font-semibold text-ink hover:text-gold hover:underline truncate max-w-md inline-block"
                              >
                                {p.name}
                              </Link>
                              <span className="text-[11px] text-muted">
                                ({new Date(p.viewedAt).toLocaleTimeString("ru-RU", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })})
                              </span>
                            </div>
                          ))}
                          {s.viewedProducts.length > 4 && (
                            <p className="text-[11px] text-muted font-semibold">
                              + ещё {s.viewedProducts.length - 4} товаров
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic">
                          Смотрел каталог / главную страницу
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
