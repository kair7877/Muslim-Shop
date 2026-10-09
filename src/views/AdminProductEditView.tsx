import { Link, useSearchParams } from "@/lib/router";
import { ProductForm } from "@/components/admin/ProductForm";
import { useStore } from "@/components/ClientProviders";

export function AdminProductEditView() {
  const search = useSearchParams();
  const id = search.get("id") ?? "";
  const { productById, loading } = useStore();

  const product = productById(id);

  if (loading) {
    return <div className="py-12 text-center text-muted">Загрузка данных товара…</div>;
  }

  if (!product) {
    return (
      <div className="rounded border border-line bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Товар с ID «{id}» не найден</h2>
        <Link href="/admin/products/" className="ms-btn ms-btn-primary mt-4">
          Назад к товарам
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">
          Редактирование товара
        </h1>
        <p className="mt-1 text-sm text-muted">ID: {product.docId}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
