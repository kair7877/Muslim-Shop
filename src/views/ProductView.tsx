import { useEffect } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { useLanguage, useStore } from "@/components/ClientProviders";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard, type CardProduct } from "@/components/ProductCard";
import { cleanTitle, parseSpecs, type RawProduct } from "@/lib/clientStore";
import { formatTenge } from "@/lib/shop";
import { trackProductView } from "@/lib/analytics";

function card(p: RawProduct, name: string, category: string): CardProduct {
  return {
    id: p.docId,
    slug: p.docId,
    name,
    price: p.price,
    oldPrice: p.oldPrice,
    status: p.inStock ? "in_stock" : "out_of_stock",
    stockQty: p.inStock ? 1 : 0,
    isNew: p.isNew,
    isSale: p.isSale,
    categoryName: category,
    image: p.images[0] ?? "",
  };
}

export function ProductView() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { lang, dict } = useLanguage();
  const { productById, products, categories, loading, settings } = useStore();

  const product = productById(id);

  useEffect(() => {
    if (product) {
      const pName = cleanTitle(product.titleRu);
      trackProductView(product.docId, pName);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="ms-container py-20 text-center text-lg text-muted">
        Загрузка информации о товаре…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ms-container py-20 text-center">
        <h1 className="text-2xl font-black text-ink">{dict.notFound}</h1>
        <p className="mt-2 text-muted">{dict.notFoundHint}</p>
        <Link href="/catalog/" className="ms-btn ms-btn-primary mt-6">
          {dict.goCatalog}
        </Link>
      </div>
    );
  }

  const localized = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);
  const name = cleanTitle(localized(product.titleRu, product.titleKz));
  const description = localized(product.descriptionRu, product.descriptionKz);
  const specs = parseSpecs(localized(product.specsRu, product.specsKz));
  const category = categories.find((c) => c.id === product.categoryId);
  const categoryName = category ? localized(category.nameRu, category.nameKz) : "";
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.docId !== product.docId)
    .slice(0, 4);

  const labels = {
    detail: dict.detail,
    toCart: dict.toCart,
    inStock: dict.inStock,
    outOfStock: dict.outOfStock,
    newBadge: lang === "kz" ? "Жаңа" : "Новинка",
    saleBadge: lang === "kz" ? "Жеңілдік" : "Скидка",
  };

  return (
    <div className="ms-container py-6 md:py-8">
      <nav className="flex flex-wrap items-center gap-2 text-[14px] text-muted">
        <Link href="/" className="hover:text-ink">
          {dict.home}
        </Link>
        <span>/</span>
        <Link href="/catalog/" className="hover:text-ink">
          {dict.catalog}
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/category/?id=${encodeURIComponent(category.id)}`}
              className="hover:text-ink"
            >
              {categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink font-semibold truncate max-w-xs">{name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-[188px] lg:self-start">
          <ProductGallery
            images={product.images.map((src) => ({ src, alt: name }))}
            name={name}
          />
        </div>

        <div>
          {categoryName && (
            <span className="inline-block rounded bg-mist px-3 py-1 text-[13px] font-semibold text-graphite uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          <h1 className="mt-3 text-[26px] font-black leading-tight text-ink md:text-[36px]">
            {name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span
              className={`rounded px-3 py-1 text-[13px] font-extrabold uppercase ${
                product.inStock ? "bg-ink text-gold-soft" : "bg-mist text-muted"
              }`}
            >
              {product.inStock ? dict.inStock : dict.outOfStock}
            </span>
            {product.sku && (
              <span className="text-sm text-muted">
                {dict.sku}: <b className="text-graphite">{product.sku}</b>
              </span>
            )}
          </div>

          <div className="mt-5 rounded border border-line bg-white p-5 shadow-xs">
            <div className="flex items-baseline gap-4">
              <span className="text-[36px] font-black leading-none text-ink md:text-[44px]">
                {formatTenge(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[20px] text-muted line-through">
                  {formatTenge(product.oldPrice)}
                </span>
              )}
            </div>

            {product.inStock ? (
              <ProductActions
                product={{
                  id: product.docId,
                  slug: product.docId,
                  name,
                  price: product.price,
                  image: product.images[0] ?? "",
                }}
                labels={{
                  toCart: dict.toCart,
                  orderNow: dict.orderNow,
                  quantity: dict.quantity,
                  outOfStock: dict.outOfStock,
                  copyLink: dict.copyLink,
                  linkCopied: dict.linkCopied,
                  share: dict.share,
                  added: dict.added,
                }}
              />
            ) : (
              <p className="mt-5 text-[16px] font-semibold text-muted">{dict.outOfStock}</p>
            )}
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            <li className="rounded border border-line bg-mist/40 p-4">
              <b className="text-sm uppercase text-graphite">{dict.pickup}</b>
              <p className="mt-1 text-[14px] text-muted">
                {localized(settings.pickupInfoRu, settings.pickupInfoKz)}
              </p>
            </li>
            <li className="rounded border border-line bg-mist/40 p-4">
              <b className="text-sm uppercase text-graphite">{dict.courier}</b>
              <p className="mt-1 text-[14px] text-muted">
                {localized(settings.deliveryInfoRu, settings.deliveryInfoKz)}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr] border-t border-line pt-10">
        <section>
          <h2 className="ms-section-title">{dict.description}</h2>
          <div className="mt-4 prose prose-neutral max-w-none">
            <p className="whitespace-pre-line text-[17px] leading-relaxed text-graphite">
              {description || "Описание готовится к публикации."}
            </p>
          </div>
        </section>

        {specs.length > 0 && (
          <section>
            <h2 className="ms-section-title">{dict.specs}</h2>
            <dl className="mt-4 overflow-hidden rounded border border-line bg-white">
              {specs.map((spec, i) => (
                <div
                  key={`${spec.name}-${i}`}
                  className="flex justify-between gap-4 border-b border-line last:border-b-0 px-4 py-3 text-sm"
                >
                  <dt className="font-bold text-graphite">{spec.name}</dt>
                  <dd className="text-right text-muted">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-line pt-10">
          <h2 className="ms-section-title">{dict.relatedProducts}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.docId}
                product={card(
                  p,
                  cleanTitle(localized(p.titleRu, p.titleKz)),
                  categoryName
                )}
                labels={labels}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
