import { ProductForm } from "@/components/admin/ProductForm";

export function AdminProductNewView() {
  return (
    <div>
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">
          Новый товар
        </h1>
        <p className="mt-1 text-sm text-muted">
          Товар сохранится в Firestore, а фотографии — в Firebase Storage / базе магазина.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
