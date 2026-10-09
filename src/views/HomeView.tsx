import { Link } from "@/lib/router";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductCard, type CardProduct } from "@/components/ProductCard";
import { SearchBox } from "@/components/HeaderClient";
import { useLanguage, useStore } from "@/components/ClientProviders";
import { cleanTitle, type RawProduct } from "@/lib/clientStore";
import { SHOP } from "@/lib/shop";

function toCard(product: RawProduct): CardProduct {
  return {
    id: product.docId,
    slug: product.docId,
    name: cleanTitle(product.titleRu),
    price: product.price,
    oldPrice: product.oldPrice,
    status: product.inStock ? "in_stock" : "out_of_stock",
    stockQty: product.inStock ? 1 : 0,
    isNew: product.isNew,
    isSale: product.isSale,
    categoryName: "",
    image: product.images[0] ?? "",
  };
}

function Section({
  title,
  products,
  labels,
}: {
  title: string;
  products: RawProduct[];
  labels: Parameters<typeof ProductCard>[0]["labels"];
}) {
  if (products.length === 0) return null;
  return (
    <section className="ms-container pt-11 md:pt-14">
      <div className="flex items-end justify-between gap-3 border-b border-line pb-3">
        <h2 className="ms-section-title">{title}</h2>
        <Link href="/catalog/" className="text-[15px] font-bold text-gold hover:underline">
          Смотреть все →
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.docId} product={toCard(product)} labels={labels} />
        ))}
      </div>
    </section>
  );
}

export function HomeView() {
  const { lang, dict } = useLanguage();
  const { products, categories, settings, loading, error } = useStore();
  const localized = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);

  const counts = new Map<string, number>();
  products.forEach((product) =>
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
  );

  const popular = products.filter((item) => item.isHit || item.isSale).slice(0, 8);
  const newest = products.filter((item) => item.isNew).slice(0, 4);
  const used = new Set([...popular, ...newest].map((item) => item.docId));
  const recommended = products.filter((item) => !used.has(item.docId)).slice(0, 8);

  const labels = {
    detail: dict.detail,
    toCart: dict.toCart,
    inStock: dict.inStock,
    outOfStock: dict.outOfStock,
    newBadge: lang === "kz" ? "Жаңа" : "Новинка",
    saleBadge: lang === "kz" ? "Жеңілдік" : "Скидка",
  };

  return (
    <div className="pb-10">
      <section className="border-b border-line bg-mist">
        <div className="ms-container py-8 md:py-12">
          <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-block rounded-[2px] bg-ink px-3 py-1 text-xs font-black uppercase tracking-widest text-gold-soft mb-3">
                Атырау • ТД «Дина рынок» • Бутик №24
              </div>
              <h1 className="text-[26px] font-black leading-tight text-ink sm:text-[34px] md:text-[42px]">
                {lang === "kz" ? "MUSLIM SHOP интернет-дүкені" : "Интернет-магазин MUSLIM SHOP"}
              </h1>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-graphite md:text-[18px]">
                {localized(settings.subtitleRu, settings.subtitleKz)}
              </p>
              <div className="mt-6 max-w-xl">
                <SearchBox
                  placeholder={dict.searchPlaceholder}
                  actionLabel={dict.searchAction}
                  hint={dict.searchHint}
                />
              </div>
            </div>

            <div className="rounded-[4px] border border-line bg-white p-5 md:p-6 shadow-sm">
              <h2 className="text-[14px] font-extrabold uppercase tracking-[0.1em] text-muted">
                {dict.howToOrder}
              </h2>
              <ol className="mt-4 space-y-3.5">
                {(lang === "kz"
                  ? [
                      "Өнімді каталогтан таңдаңыз",
                      "Себетке қосып, тапсырысты ресімдеңіз",
                      "Менеджер қоңырау шалып, жеткізуді растайды",
                    ]
                  : [
                      "Выберите товар из каталога",
                      "Добавьте в корзину и оформите заказ",
                      "Менеджер свяжется для подтверждения и быстрой доставки",
                    ]
                ).map((text, index) => (
                  <li key={text} className="flex items-center gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-ink text-[16px] font-black text-gold-soft">
                      {index + 1}
                    </span>
                    <span className="text-[15px] font-bold text-ink">{text}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ms-btn ms-btn-gold w-full text-sm"
                >
                  WhatsApp
                </a>
                <Link href="/catalog/" className="ms-btn ms-btn-primary w-full text-sm">
                  {dict.catalog}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="ms-container py-16 text-center text-[18px] text-muted">
          Загрузка каталога…
        </div>
      )}

      {error && (
        <div className="ms-container py-6">
          <p className="rounded border border-line p-4 text-center text-sm text-muted">{error}</p>
        </div>
      )}

      {!loading && (
        <>
          <section className="ms-container pt-9 md:pt-12">
            <div className="flex items-end justify-between gap-3 border-b border-line pb-3">
              <h2 className="ms-section-title">{dict.catalog}</h2>
              <Link href="/catalog/" className="text-[15px] font-bold text-gold">
                {dict.allProducts} →
              </Link>
            </div>
            <div className="mt-5">
              <CategoryGrid
                categories={categories.map((category) => ({
                  id: category.id,
                  name: localized(category.nameRu, category.nameKz),
                  productCount: counts.get(category.id) ?? 0,
                  isFeatured: category.order > 0 && category.order <= 8,
                }))}
                labels={{
                  all: dict.allCategories,
                  hide: dict.hideCategories,
                  products: lang === "kz" ? "өнім" : "товаров",
                }}
              />
            </div>
          </section>

          <Section
            title={dict.popular}
            products={popular.length ? popular : products.slice(0, 8)}
            labels={labels}
          />

          <Section
            title={dict.newItems}
            products={newest.length ? newest : products.slice(8, 12)}
            labels={labels}
          />

          <Section title={dict.recommended} products={recommended} labels={labels} />

          <section className="ms-container pt-12 md:pt-16">
            <div className="rounded-[4px] border border-line bg-white p-6 md:p-9 shadow-xs">
              <h2 className="ms-section-title">{dict.aboutTitle}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-graphite md:text-[18px]">
                {localized(settings.subtitleRu, settings.subtitleKz)}{" "}
                {localized(settings.deliveryInfoRu, settings.deliveryInfoKz)}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-graphite">
                <div className="flex items-center gap-2">
                  <span className="text-gold">📍</span>
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold">⏰</span>
                  <span>{localized(settings.workingHoursRu, settings.workingHoursKz)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="ms-container pt-10 md:pt-14">
            <div className="rounded-[4px] bg-graphite p-6 text-white md:p-9">
              <h2 className="text-[20px] font-extrabold uppercase md:text-[24px]">
                {dict.socialTitle}
              </h2>
              <p className="mt-2 text-white/70 text-sm">{dict.socialHint}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <a
                  href={`https://www.instagram.com/${settings.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-white/20 px-5 py-4 font-bold transition-colors hover:border-gold-soft hover:bg-white/5"
                >
                  Instagram · {settings.instagram}
                </a>
                <a
                  href={SHOP.tiktokHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-white/20 px-5 py-4 font-bold transition-colors hover:border-gold-soft hover:bg-white/5"
                >
                  TikTok · {SHOP.tiktokHandle}
                </a>
                <a
                  href={SHOP.telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-white/20 px-5 py-4 font-bold transition-colors hover:border-gold-soft hover:bg-white/5"
                >
                  Telegram · {SHOP.telegramHandle}
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
