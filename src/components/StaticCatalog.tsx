import { useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router";
import { useLanguage, useStore } from "@/components/ClientProviders";
import { ProductCard, type CardProduct } from "@/components/ProductCard";
import { cleanTitle, type RawProduct } from "@/lib/clientStore";

function card(product: RawProduct, categoryName: string): CardProduct {
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
    categoryName,
    image: product.images[0] ?? "",
  };
}

export function StaticCatalog({ fixedCategoryId }: { fixedCategoryId?: string }) {
  const search = useSearchParams();
  const { lang, dict } = useLanguage();
  const { products, categories, loading } = useStore();
  const [categoryId, setCategoryId] = useState(fixedCategoryId ?? search.get("cat") ?? "");
  const [sort, setSort] = useState(search.get("sort") ?? "popular");
  const [stock, setStock] = useState(search.get("stock") === "1");
  const [min, setMin] = useState(search.get("min") ?? "");
  const [max, setMax] = useState(search.get("max") ?? "");
  const query = (search.get("q") ?? "").trim().toLowerCase();
  const localized = (ru: string, kz: string) => (lang === "kz" && kz ? kz : ru);
  const categoryMap = new Map(categories.map((c) => [c.id, localized(c.nameRu, c.nameKz)]));
  const title = fixedCategoryId
    ? categoryMap.get(fixedCategoryId) ?? dict.catalog
    : query
    ? `${dict.searchResults}: «${search.get("q")}»`
    : dict.catalog;

  const result = useMemo(() => {
    const low = Number(min) || 0;
    const high = Number(max) || Infinity;
    return products
      .filter(
        (p) =>
          (!categoryId || p.categoryId === categoryId) &&
          (!stock || p.inStock) &&
          p.price >= low &&
          p.price <= high &&
          (!query ||
            [p.titleRu, p.titleKz, p.sku, p.descriptionRu].join(" ").toLowerCase().includes(query))
      )
      .sort((a, b) => {
        if (sort === "price_asc") return a.price - b.price;
        if (sort === "price_desc") return b.price - a.price;
        if (sort === "new") {
          return Number(b.isNew) - Number(a.isNew) || Date.parse(b.createdAt) - Date.parse(a.createdAt);
        }
        return Number(b.isHit || b.isSale) - Number(a.isHit || a.isSale);
      });
  }, [products, categoryId, stock, min, max, query, sort]);

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
      <nav className="flex items-center gap-2 text-[14px] text-muted">
        <Link href="/">{dict.home}</Link>
        <span>/</span>
        <span>{title}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-black uppercase md:text-[34px]">{title}</h1>
          <p className="mt-1 text-muted">
            {dict.foundProducts}: {result.length}
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ms-field min-h-12 w-full font-semibold sm:w-[260px]"
        >
          <option value="popular">{dict.sortPopular}</option>
          <option value="price_asc">{dict.sortPriceAsc}</option>
          <option value="price_desc">{dict.sortPriceDesc}</option>
          <option value="new">{dict.sortNew}</option>
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded border border-line p-5 lg:sticky lg:top-[188px] lg:self-start bg-white">
          <h2 className="ms-label">{dict.filters}</h2>
          <div className="mt-4 grid gap-4">
            {!fixedCategoryId && (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="ms-field"
              >
                <option value="">{dict.allCategories}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {localized(c.nameRu, c.nameKz)}
                  </option>
                ))}
              </select>
            )}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder={dict.filterPriceFrom}
                className="ms-field"
              />
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder={dict.filterPriceTo}
                className="ms-field"
              />
            </div>
            <label className="flex items-center gap-3 text-[15px] font-semibold text-graphite cursor-pointer">
              <input
                type="checkbox"
                checked={stock}
                onChange={(e) => setStock(e.target.checked)}
                className="h-5 w-5 rounded border-line"
              />
              {dict.filterOnlyStock}
            </label>
            <button
              type="button"
              onClick={() => {
                setCategoryId(fixedCategoryId ?? "");
                setMin("");
                setMax("");
                setStock(false);
                setSort("popular");
              }}
              className="ms-btn ms-btn-outline"
            >
              {dict.resetFilters}
            </button>
          </div>
        </aside>

        <div>
          {loading ? (
            <p className="py-12 text-center text-muted">Загрузка товаров…</p>
          ) : result.length === 0 ? (
            <div className="rounded border border-line bg-white p-8 text-center">
              <p className="text-lg font-bold text-graphite">{dict.searchNoResults}</p>
              <button
                type="button"
                onClick={() => {
                  setCategoryId("");
                  setMin("");
                  setMax("");
                  setStock(false);
                }}
                className="ms-btn ms-btn-primary mt-4"
              >
                {dict.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {result.map((p) => (
                <ProductCard
                  key={p.docId}
                  product={card(p, categoryMap.get(p.categoryId) ?? "")}
                  labels={labels}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
