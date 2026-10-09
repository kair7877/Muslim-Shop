import { useRef, useState } from "react";
import { Link, useRouter } from "@/lib/router";
import { useStore } from "@/components/ClientProviders";
import { saveProduct, type RawProduct } from "@/lib/clientStore";

async function compress(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = raw;
  });
  const scale = Math.min(1, 1000 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return raw;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function ProductForm({ product }: { product?: RawProduct }) {
  const { categories, refresh } = useStore();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titleRu: product?.titleRu ?? "",
    titleKz: product?.titleKz ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    price: String(product?.price ?? ""),
    oldPrice: product?.oldPrice ? String(product.oldPrice) : "",
    inStock: product?.inStock ?? true,
    isNew: product?.isNew ?? true,
    isHit: product?.isHit ?? false,
    isSale: product?.isSale ?? false,
    descriptionRu: product?.descriptionRu ?? "",
    descriptionKz: product?.descriptionKz ?? "",
    specsRu: product?.specsRu ?? "",
    specsKz: product?.specsKz ?? "",
  });

  const [existing, setExisting] = useState(product?.images ?? []);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function files(list: FileList | null) {
    if (!list) return;
    const output: string[] = [];
    for (const file of Array.from(list).slice(0, 8)) {
      if (file.type.startsWith("image/")) {
        output.push(await compress(file));
      }
    }
    setNewImages((old) => [...old, ...output].slice(0, 8));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save() {
    if (form.titleRu.trim().length < 2 || !form.categoryId || !form.price) {
      setError("Заполните название, категорию и цену товара.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const id = await saveProduct(
        product?.docId ?? null,
        {
          titleRu: form.titleRu.trim(),
          titleKz: form.titleKz.trim(),
          sku: form.sku.trim(),
          categoryId: form.categoryId,
          price: Number(form.price),
          oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
          inStock: form.inStock,
          isNew: form.isNew,
          isHit: form.isHit,
          isSale: form.isSale,
          descriptionRu: form.descriptionRu.trim(),
          descriptionKz: form.descriptionKz.trim(),
          specsRu: form.specsRu.trim(),
          specsKz: form.specsKz.trim(),
          images: existing,
          createdAt: product?.createdAt ?? "",
        },
        newImages
      );
      await refresh();
      setSuccess("Товар успешно сохранен!");
      setTimeout(() => {
        router.push("/admin/products/");
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения товара");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded border border-line bg-white p-5 shadow-xs">
          <h2 className="text-[17px] font-extrabold uppercase text-ink">Фотографии товара</h2>
          <p className="mt-1 text-sm text-muted">
            Загрузите до 8 изображений. Первое изображение будет обложкой товара.
          </p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => void files(e.target.files)}
            className="mt-4 block w-full rounded border border-line p-2.5 text-sm"
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {existing.map((src, i) => (
              <div key={src} className="overflow-hidden rounded border border-line">
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setExisting((all) => all.filter((_, x) => x !== i))}
                  className="w-full bg-mist py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Удалить
                </button>
              </div>
            ))}
            {newImages.map((src, i) => (
              <div key={i} className="overflow-hidden rounded border-2 border-gold">
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewImages((all) => all.filter((_, x) => x !== i))}
                  className="w-full bg-mist py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Удалить новое
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-line bg-white p-5 shadow-xs">
          <h2 className="text-[17px] font-extrabold uppercase text-ink">Название и описание</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="ms-label">Название (RU) *</label>
              <input
                className="ms-field"
                placeholder="Название RU *"
                value={form.titleRu}
                onChange={(e) => update("titleRu", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Название (KZ)</label>
              <input
                className="ms-field"
                placeholder="Название KZ"
                value={form.titleKz}
                onChange={(e) => update("titleKz", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Описание (RU)</label>
              <textarea
                className="ms-field min-h-36"
                placeholder="Подробное описание товара на русском языке..."
                value={form.descriptionRu}
                onChange={(e) => update("descriptionRu", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Описание (KZ)</label>
              <textarea
                className="ms-field min-h-28"
                placeholder="Өнімнің қазақ тіліндегі толық сипаттамасы..."
                value={form.descriptionKz}
                onChange={(e) => update("descriptionKz", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Характеристики (RU)</label>
              <textarea
                className="ms-field min-h-24"
                placeholder={"Объём: 500 мл\nСтрана: Египет\nБренд: El-Hawag"}
                value={form.specsRu}
                onChange={(e) => update("specsRu", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Характеристики (KZ)</label>
              <textarea
                className="ms-field min-h-24"
                placeholder={"Көлемі: 500 мл\nЕл: Мысыр"}
                value={form.specsKz}
                onChange={(e) => update("specsKz", e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded border border-line bg-white p-5 shadow-xs">
          <h2 className="text-[17px] font-extrabold uppercase text-ink">Цена и параметры</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="ms-label">Цена (₸) *</label>
              <input
                type="number"
                className="ms-field font-bold text-lg"
                placeholder="Цена ₸ *"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Старая цена (₸)</label>
              <input
                type="number"
                className="ms-field"
                placeholder="Старая цена (для скидки)"
                value={form.oldPrice}
                onChange={(e) => update("oldPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="ms-label">Категория *</label>
              <select
                className="ms-field font-semibold"
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
              >
                <option value="">Выберите категорию *</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameRu}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="ms-label">Артикул / SKU</label>
              <input
                className="ms-field"
                placeholder="MS-0101"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-line">
              {[
                ["inStock", "В наличии на складе"],
                ["isHit", "Хит продаж"],
                ["isSale", "Скидка / Акция"],
                ["isNew", "Новинка"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 font-semibold text-graphite cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-line"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
            {success}
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="ms-btn ms-btn-primary w-full text-base"
        >
          {busy ? "Сохранение в Firebase…" : "СОХРАНИТЬ ТОВАР"}
        </button>
        <Link href="/admin/products/" className="ms-btn ms-btn-outline w-full text-sm">
          Назад к списку товаров
        </Link>
      </aside>
    </div>
  );
}
