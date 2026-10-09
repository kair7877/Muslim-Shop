import { Link } from "@/lib/router";
import { useLanguage, useStore } from "@/components/ClientProviders";
import { SHOP } from "@/lib/shop";

export function Footer() {
  const { lang, dict } = useLanguage();
  const { categories, settings } = useStore();
  const localized = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);
  const instagram = settings.instagram.replace(/^@/, "");

  return (
    <footer className="mt-16 border-t border-line bg-graphite text-white">
      <div className="ms-container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-white text-[19px] font-black text-gold">
              MS
            </span>
            <span className="text-[20px] font-black uppercase tracking-[0.02em]">
              Muslim Shop
            </span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70">
            {localized(settings.taglineRu, settings.taglineKz)}
            <br />
            {settings.address}
            <br />
            {settings.city}, Казахстан
          </p>
          <a
            href={`tel:+${settings.whatsappNumber}`}
            className="mt-4 inline-block text-[19px] font-extrabold text-gold-soft hover:text-white"
          >
            +{settings.whatsappNumber}
          </a>
        </div>

        <div>
          <h3 className="text-[14px] font-extrabold uppercase tracking-[0.1em] text-white/60">
            {dict.catalog}
          </h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {categories.slice(0, 8).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/?id=${encodeURIComponent(category.id)}`}
                  className="text-white/85 hover:text-gold-soft"
                >
                  {localized(category.nameRu, category.nameKz)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalog/" className="font-bold text-gold-soft hover:text-white">
                {dict.allCategories}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[14px] font-extrabold uppercase tracking-[0.1em] text-white/60">
            MUSLIM SHOP
          </h3>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li>
              <Link href="/about/" className="text-white/85 hover:text-gold-soft">
                {dict.about}
              </Link>
            </li>
            <li>
              <Link href="/contacts/" className="text-white/85 hover:text-gold-soft">
                {dict.contacts}
              </Link>
            </li>
            <li>
              <Link href="/cart/" className="text-white/85 hover:text-gold-soft">
                {dict.cart}
              </Link>
            </li>
            <li>
              <Link href="/namaz/" className="text-white/85 hover:text-gold-soft">
                {dict.namaz}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[14px] font-extrabold uppercase tracking-[0.1em] text-white/60">
            {dict.socialTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li>
              <a
                href={`https://www.instagram.com/${instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[4px] border border-white/15 px-4 py-2.5 font-semibold text-white/90 hover:border-gold-soft"
              >
                <span>Instagram</span>
                <span className="text-white/60">{settings.instagram}</span>
              </a>
            </li>
            <li>
              <a
                href={SHOP.tiktokHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[4px] border border-white/15 px-4 py-2.5 font-semibold text-white/90 hover:border-gold-soft"
              >
                <span>TikTok</span>
                <span className="text-white/60">{SHOP.tiktokHandle}</span>
              </a>
            </li>
            <li>
              <a
                href={SHOP.telegramHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-[4px] border border-white/15 px-4 py-2.5 font-semibold text-white/90 hover:border-gold-soft"
              >
                <span>Telegram</span>
                <span className="text-white/60">{SHOP.telegramHandle}</span>
              </a>
            </li>
          </ul>
          <p className="mt-4 text-[14px] text-white/60">
            {localized(settings.workingHoursRu, settings.workingHoursKz)}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="ms-container flex flex-col gap-2 py-5 text-[13px] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. {settings.city}, {settings.boutiqueNumber}.
          </p>
          <p>Цены указаны в тенге ₸. Доставка по Атырау и всему Казахстану.</p>
        </div>
      </div>
    </footer>
  );
}
