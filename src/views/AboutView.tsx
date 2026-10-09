import { useLanguage, useStore } from "@/components/ClientProviders";

export function AboutView() {
  const { lang, dict } = useLanguage();
  const { settings } = useStore();
  const l = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);

  return (
    <div className="ms-container py-6 md:py-10">
      <h1 className="text-[26px] font-black uppercase md:text-[36px]">{dict.aboutTitle}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded border border-line bg-white p-6 shadow-xs">
          <h2 className="text-2xl font-extrabold text-ink">{settings.storeName}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-graphite md:text-[18px]">
            {l(settings.subtitleRu, settings.subtitleKz)}
          </p>
          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-lg font-bold uppercase text-ink">Доставка и получение</h3>
            <p className="mt-3 text-[17px] leading-relaxed text-graphite">
              {l(settings.deliveryInfoRu, settings.deliveryInfoKz)}
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-graphite">
              {l(settings.pickupInfoRu, settings.pickupInfoKz)}
            </p>
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-lg font-bold uppercase text-ink">Оригинальная продукция</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Мы тщательно отбираем только натуральные товары, оригинальные арабские масляные духи, сертифицированные витамины и целебные масла без искусственных добавок.
            </p>
          </div>
        </section>

        <aside className="rounded bg-graphite p-6 text-white shadow-xs">
          <h2 className="text-lg font-extrabold uppercase">{dict.contactsTitle}</h2>
          <div className="mt-4 space-y-4 text-sm text-white/80">
            <div>
              <p className="text-xs uppercase text-white/50 font-bold">{dict.addressLabel}</p>
              <p className="text-base font-semibold text-white mt-1">{settings.address}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-white/50 font-bold">{dict.workingHours}</p>
              <p className="text-base font-semibold text-white mt-1">
                {l(settings.workingHoursRu, settings.workingHoursKz)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-white/50 font-bold">Телефон / WhatsApp</p>
              <a
                href={`tel:+${settings.whatsappNumber}`}
                className="text-lg font-bold text-gold-soft hover:underline mt-1 block"
              >
                +{settings.whatsappNumber}
              </a>
            </div>
          </div>
          <a
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="ms-btn ms-btn-gold mt-6 w-full"
          >
            Написать в WhatsApp
          </a>
        </aside>
      </div>
    </div>
  );
}
