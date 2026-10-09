import { CategoryManager } from "@/components/admin/CategoryManager";

export function AdminCategoriesView() {
  return (
    <div>
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-[26px] font-black uppercase md:text-[32px] text-ink">
          Категории
        </h1>
        <p className="mt-1 text-sm text-muted">
          Управление каталогом и порядком отображения разделов.
        </p>
      </div>
      <CategoryManager />
    </div>
  );
}
