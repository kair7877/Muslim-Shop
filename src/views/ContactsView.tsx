import { useLanguage, useStore } from "@/components/ClientProviders";
import { SHOP } from "@/lib/shop";

export function ContactsView() {
  const { lang, dict } = useLanguage();
  const { settings } = useStore();
  const l = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);

  return (
    <div className="ms-container py-6 md:py-10">
      <h1 className="text-[26px] font-black uppercase md:text-[36px]">{dict.contactsTitle}</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label">{dict.addressLabel}</p>
          <p className="text-xl font-black text-ink">{settings.address}</p>
          <p className="mt-1 text-sm text-muted">{settings.boutiqueNumber}</p>
        </div>
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label">{dict.phone}</p>
          <a
            href={`tel:+${settings.whatsappNumber}`}
            className="text-xl font-black text-ink hover:text-gold"
          >
            +{settings.whatsappNumber}
          </a>
          <p className="mt-1 text-sm text-muted">WhatsApp & Звонки</p>
        </div>
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <p className="ms-label">{dict.workingHours}</p>
          <p className="text-xl font-black text-ink">
            {l(settings.workingHoursRu, settings.workingHoursKz)}
          </p>
          <p className="mt-1 text-sm text-muted">Без выходных</p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <b className="text-lg text-ink uppercase">{dict.pickup}</b>
          <p className="mt-2 text-graphite leading-relaxed">
            {l(settings.pickupInfoRu, settings.pickupInfoKz)}
          </p>
        </div>
        <div className="rounded border border-line bg-white p-5 shadow-xs">
          <b className="text-lg text-ink uppercase">{dict.courier}</b>
          <p className="mt-2 text-graphite leading-relaxed">
            {l(settings.deliveryInfoRu, settings.deliveryInfoKz)}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded bg-graphite p-6 text-white md:p-9 shadow-xs">
        <h2 className="text-2xl font-extrabold">{dict.socialTitle}</h2>
        <p className="mt-2 text-white/70 text-sm">
          Следите за новыми поступлениями, акциями и отзывами покупателей:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <a
            href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-white/20 p-4 font-bold hover:border-gold-soft hover:bg-white/5 transition-colors"
          >
            Instagram · {settings.instagram}
          </a>
          <a
            href={SHOP.tiktokHref}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-white/20 p-4 font-bold hover:border-gold-soft hover:bg-white/5 transition-colors"
          >
            TikTok · {SHOP.tiktokHandle}
          </a>
          <a
            href={SHOP.telegramHref}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-white/20 p-4 font-bold hover:border-gold-soft hover:bg-white/5 transition-colors"
          >
            Telegram · {SHOP.telegramHandle}
          </a>
        </div>
      </section>
    </div>
  );
}
