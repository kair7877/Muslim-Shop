import { useState } from "react";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useStore } from "@/components/ClientProviders";
import { getFirebaseClientFirestore } from "@/lib/firebaseClient";
import type { RawCategory } from "@/lib/clientStore";

export function CategoryManager() {
  const { categories, products, refresh } = useStore();
  const [rows, setRows] = useState<RawCategory[]>(categories);
  const [draft, setDraft] = useState({ nameRu: "", nameKz: "", icon: "", order: "100" });
  const [error, setError] = useState("");
  const actual = rows.length === categories.length ? rows : categories;

  const patch = (id: string, values: Partial<RawCategory>) =>
    setRows(actual.map((r) => (r.id === id ? { ...r, ...values } : r)));

  async function save(row: RawCategory) {
    try {
      await setDoc(doc(getFirebaseClientFirestore(), "categories", row.id), row, { merge: true });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  }

  async function remove(row: RawCategory) {
    if (products.some((p) => p.categoryId === row.id)) {
      setError("В категории есть товары. Сначала перенесите их в другую категорию.");
      return;
    }
    if (!confirm(`Удалить категорию «${row.nameRu}»?`)) return;
    try {
      await deleteDoc(doc(getFirebaseClientFirestore(), "categories", row.id));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
    }
  }

  async function create() {
    if (draft.nameRu.trim().length < 2) return;
    const id = `cat-${Date.now()}`;
    try {
      await setDoc(doc(getFirebaseClientFirestore(), "categories", id), {
        id,
        nameRu: draft.nameRu.trim(),
        nameKz: draft.nameKz.trim(),
        icon: draft.icon.trim(),
        order: Number(draft.order) || 100,
      });
      setDraft({ nameRu: "", nameKz: "", icon: "", order: "100" });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка добавления");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded border border-line bg-white shadow-xs">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="bg-mist text-left text-xs uppercase text-muted">
              <th className="p-3">RU</th>
              <th className="p-3">KZ</th>
              <th className="p-3">Иконка</th>
              <th className="p-3">Порядок</th>
              <th className="p-3">Товаров</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {actual.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="p-3">
                  <input
                    className="ms-field"
                    value={row.nameRu}
                    onChange={(e) => patch(row.id, { nameRu: e.target.value })}
                  />
                </td>
                <td className="p-3">
                  <input
                    className="ms-field"
                    value={row.nameKz}
                    onChange={(e) => patch(row.id, { nameKz: e.target.value })}
                  />
                </td>
                <td className="p-3">
                  <input
                    className="ms-field w-20 text-center"
                    value={row.icon}
                    onChange={(e) => patch(row.id, { icon: e.target.value })}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    className="ms-field w-24"
                    value={row.order}
                    onChange={(e) => patch(row.id, { order: Number(e.target.value) })}
                  />
                </td>
                <td className="p-3 font-bold text-ink">
                  {products.filter((p) => p.categoryId === row.id).length}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => save(row)}
                      className="ms-btn ms-btn-primary h-10 px-3 text-sm"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => remove(row)}
                      className="ms-btn ms-btn-outline h-10 px-3 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="rounded border border-line bg-white p-5 shadow-xs">
        <h2 className="text-lg font-extrabold uppercase">Новая категория</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="ms-field"
            placeholder="Название RU (например: Травяные чаи)"
            value={draft.nameRu}
            onChange={(e) => setDraft({ ...draft, nameRu: e.target.value })}
          />
          <input
            className="ms-field"
            placeholder="Название KZ (мысалы: Шөп шайлары)"
            value={draft.nameKz}
            onChange={(e) => setDraft({ ...draft, nameKz: e.target.value })}
          />
          <input
            className="ms-field"
            placeholder="Иконка (эмодзи или текст, например: 🫖)"
            value={draft.icon}
            onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
          />
          <input
            type="number"
            className="ms-field"
            placeholder="Порядок отображения"
            value={draft.order}
            onChange={(e) => setDraft({ ...draft, order: e.target.value })}
          />
        </div>
        <button onClick={create} className="ms-btn ms-btn-primary mt-4">
          + ДОБАВИТЬ КАТЕГОРИЮ
        </button>
      </section>
    </div>
  );
}
