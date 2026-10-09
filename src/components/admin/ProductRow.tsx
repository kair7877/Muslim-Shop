import { useState } from "react";
import { Link } from "@/lib/router";
import { useStore } from "@/components/ClientProviders";
import { cleanTitle, removeProduct, setProductStock, type RawProduct } from "@/lib/clientStore";
import { formatTenge } from "@/lib/shop";

export function ProductRow({
  product,
  categoryName,
}: {
  product: RawProduct;
  categoryName: string;
}) {
  const { refresh } = useStore();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await setProductStock(product.docId, !product.inStock);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Удалить «${product.titleRu}» из каталога?`)) return;
    setBusy(true);
    try {
      await removeProduct(product.docId);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-line hover:bg-mist/30 transition-colors">
      <td className="p-3">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt=""
            className="h-16 w-16 rounded border border-line object-cover"
          />
        ) : (
          <span className="block h-16 w-16 rounded border border-line bg-mist" />
        )}
      </td>
      <td className="p-3">
        <Link
          href={`/admin/products/edit/?id=${encodeURIComponent(product.docId)}`}
          className="font-bold text-ink hover:text-gold hover:underline"
        >
          {cleanTitle(product.titleRu).slice(0, 75)}
        </Link>
        <p className="mt-0.5 text-[13px] text-muted">
          {categoryName} · {product.sku || product.docId}
        </p>
      </td>
      <td className="p-3 whitespace-nowrap font-black text-ink">
        {formatTenge(product.price)}
      </td>
      <td className="p-3">
        <span
          className={`inline-block rounded px-2 py-1 text-[12px] font-bold ${
            product.inStock ? "bg-ink text-gold-soft" : "bg-mist text-muted"
          }`}
        >
          {product.inStock ? "В наличии" : "Нет"}
        </span>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/products/edit/?id=${encodeURIComponent(product.docId)}`}
            className="ms-btn ms-btn-outline h-9 px-3 text-[13px]"
          >
            Изменить
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={toggle}
            className="ms-btn ms-btn-outline h-9 px-3 text-[13px]"
          >
            {product.inStock ? "Скрыть" : "Показать"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="ms-btn ms-btn-outline h-9 px-3 text-[13px] text-red-600 hover:border-red-600"
          >
            Удалить
          </button>
        </div>
      </td>
    </tr>
  );
}
