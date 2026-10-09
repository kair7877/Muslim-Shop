import { useEffect, useState } from "react";
import { useLanguage } from "@/components/ClientProviders";

const rows = [
  ["Fajr", "Фаджр (Утренний)", "Таң"],
  ["Sunrise", "Восход солнца", "Күн шығуы"],
  ["Dhuhr", "Зухр (Полуденный)", "Бесін"],
  ["Asr", "Аср (Послеполуденный)", "Екінті"],
  ["Maghrib", "Магриб (Вечерний)", "Ақшам"],
  ["Isha", "Иша (Ночной)", "Құптан"],
];

export function NamazView() {
  const { lang, dict } = useLanguage();
  const [times, setTimes] = useState<Record<string, string>>({
    Fajr: "05:42",
    Sunrise: "07:12",
    Dhuhr: "13:30",
    Asr: "17:05",
    Maghrib: "19:48",
    Isha: "21:18",
  });
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Atyrau&country=Kazakhstan&method=2")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.timings) {
          setTimes(d.data.timings);
          if (d.data.date?.readable) {
            setDateStr(d.data.date.readable);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="ms-container py-6 md:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
          <div>
            <h1 className="text-[26px] font-black uppercase md:text-[36px]">{dict.namaz}</h1>
            <p className="mt-1 text-base text-muted">
              {lang === "kz" ? "Атырау қаласы бойынша" : "город Атырау, Казахстан"}
            </p>
          </div>
          {dateStr && <span className="text-sm font-semibold text-gold">{dateStr}</span>}
        </div>

        <ul className="mt-6 divide-y divide-line rounded border border-line bg-white shadow-xs">
          {rows.map(([key, ru, kz]) => (
            <li
              key={key}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-mist/40"
            >
              <div>
                <b className="text-lg text-ink">{lang === "kz" ? kz : ru}</b>
                <p className="text-xs text-muted font-medium">{key}</p>
              </div>
              <span className="text-2xl font-black text-gold">
                {times[key]?.slice(0, 5) || "—"}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded border border-line bg-mist/50 p-4 text-sm text-graphite leading-relaxed">
          Время намаза рассчитывается по географическим координатам города Атырау в соответствии со стандартом ДУМК (метод 2).
        </div>
      </div>
    </div>
  );
}
