import { Link } from "@/lib/router";
import { CartLink, LangSwitch, MobileMenu, SearchBox } from "@/components/HeaderClient";
import { useLanguage, useStore } from "@/components/ClientProviders";
import { SHOP } from "@/lib/shop";

function phone(digits: string): string {
  const value = digits.replace(/\D/g, "");
  return value.length === 11
    ? `+7 ${value.slice(1, 4)} ${value.slice(4, 7)} ${value.slice(7, 9)} ${value.slice(9)}`
    : `+${value}`;
}

export function Header() {
  const { lang, dict } = useLanguage();
  const { categories, products, settings } = useStore();
  const localized = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);
  const counts = new Map<string, number>();
  products.forEach((product) =>
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
  );
  const shown = categories.slice(0, 10);
  const instagram = settings.instagram.replace(/^@/, "");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white shadow-xs">
      <div className="hidden bg-graphite text-white md:block">
        <div className="ms-container flex h-10 items-center justify-between text-[13px] md:text-[14px]">
          <p className="font-semibold tracking-[0.06em] text-white/80">
            {localized(settings.taglineRu, settings.taglineKz)}
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`tel:+${settings.whatsappNumber}`}
              className="font-bold text-white hover:text-gold-soft"
            >
              {phone(settings.whatsappNumber)}
            </a>
            <span className="h-4 w-px bg-white/25" />
            <a
              href={`https://www.instagram.com/${instagram}`}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white"
            >
              Instagram
            </a>
            <a
              href={SHOP.tiktokHref}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white"
            >
              TikTok
            </a>
            <a
              href={SHOP.telegramHref}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>

      <div className="ms-container flex flex-wrap items-center gap-2 py-2.5 md:gap-3 md:py-3">
        <div className="flex shrink-0 items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-ink text-[19px] font-black tracking-tight text-gold-soft md:h-14 md:w-14 md:text-[22px]">
              MS
            </span>
          </Link>
          <div className="leading-none">
            <Link href="/" className="block text-[19px] font-black uppercase tracking-[0.02em] text-ink md:text-[22px]">
              Muslim Shop
            </Link>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <span>{settings.city} · {settings.boutiqueNumber}</span>
              <Link
                href="/admin/login/"
                className="opacity-30 hover:opacity-100 transition-opacity ml-0.5 text-[11px]"
                title="Панель"
                aria-label="Вход"
              >
                🔒
              </Link>
            </div>
          </div>
        </div>

        <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1">
          <SearchBox
            placeholder={dict.searchPlaceholder}
            actionLabel={dict.searchAction}
            hint={dict.searchHint}
          />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <MobileMenu
            menuLabel={dict.menu}
            allLabel={dict.catalog}
            categories={categories.map((category) => ({
              id: category.id,
              name: localized(category.nameRu, category.nameKz),
              productCount: counts.get(category.id) ?? 0,
            }))}
            extraLinks={[
              { href: "/", label: dict.home },
              { href: "/catalog/", label: dict.catalog },
              { href: "/about/", label: dict.about },
              { href: "/contacts/", label: dict.contacts },
              { href: "/namaz/", label: dict.namaz },
            ]}
          />
          <div className="hidden lg:block">
            <Link
              href="/catalog/"
              className="flex h-12 items-center rounded-[4px] border border-line bg-white px-5 text-[14px] font-bold uppercase tracking-wide text-ink hover:border-ink md:h-14 md:text-[15px]"
            >
              {dict.catalog}
            </Link>
          </div>
          <LangSwitch />
          <CartLink label={dict.cart} />
        </div>
      </div>

      <nav className="hidden border-t border-line bg-white lg:block">
        <div className="ms-container no-scrollbar flex items-center gap-1 overflow-x-auto py-1.5">
          <Link
            href="/catalog/"
            className="whitespace-nowrap rounded-[3px] px-3 py-1.5 text-[14px] font-extrabold uppercase tracking-wide text-ink hover:bg-mist"
          >
            {dict.allCategories}
          </Link>
          {shown.map((category) => (
            <Link
              key={category.id}
              href={`/category/?id=${encodeURIComponent(category.id)}`}
              className="whitespace-nowrap rounded-[3px] px-3 py-1.5 text-[14px] font-semibold text-graphite hover:bg-mist hover:text-ink"
            >
              {localized(category.nameRu, category.nameKz)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
