import { useState } from "react";
import { Link } from "@/lib/router";
import { useStore } from "@/components/ClientProviders";
import { ProductRow } from "@/components/admin/ProductRow";

export function AdminProductsView() {
  const { products, categories } = useStore();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const shown = products.filter(
    (p) =>
      !term ||
      [p.titleRu, p.titleKz, p.sku, p.descriptionRu].join(" ").toLowerCase().includes(term)
  );
  const names = new Map(categories.map((c) => [c.id, c.nameRu]));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">Товары</h1>
          <p className="text-sm text-muted">
            Всего в каталоге: {products.length} товаров ({shown.length} показано)
          </p>
        </div>
        <Link href="/admin/products/new/" className="ms-btn ms-btn-primary">
          + ДОБАВИТЬ ТОВАР
        </Link>
      </div>

      <div className="mt-5 max-w-md">
        <input
          className="ms-field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию или артикулу..."
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded border border-line bg-white shadow-xs">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-mist text-left text-xs uppercase text-muted">
              <th className="p-3">Фото</th>
              <th className="p-3">Товар</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Наличие</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  Товары не найдены.
                </td>
              </tr>
            ) : (
              shown.map((p) => (
                <ProductRow
                  key={p.docId}
                  product={p}
                  categoryName={names.get(p.categoryId) ?? "—"}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
