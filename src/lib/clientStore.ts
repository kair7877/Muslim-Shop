import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  getFirebaseClientFirestore,
  getFirebaseClientStorage,
} from "@/lib/firebaseClient";
import { slugify } from "@/lib/shop";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "./demoData";

export type RawProduct = {
  id: string;
  docId: string;
  titleRu: string;
  titleKz: string;
  descriptionRu: string;
  descriptionKz: string;
  specsRu: string;
  specsKz: string;
  price: number;
  oldPrice: number | null;
  categoryId: string;
  images: string[];
  inStock: boolean;
  isNew: boolean;
  isHit: boolean;
  isSale: boolean;
  sku: string;
  createdAt: string;
};

export type RawCategory = {
  id: string;
  nameRu: string;
  nameKz: string;
  icon: string;
  order: number;
};

export type ShopSettings = {
  storeName: string;
  taglineRu: string;
  taglineKz: string;
  subtitleRu: string;
  subtitleKz: string;
  city: string;
  address: string;
  boutiqueNumber: string;
  workingHoursRu: string;
  workingHoursKz: string;
  currency: string;
  instagram: string;
  whatsappNumber: string;
  pickupInfoRu: string;
  pickupInfoKz: string;
  deliveryInfoRu: string;
  deliveryInfoKz: string;
};

export type OrderItem = {
  productId: string;
  nameSnapshot: string;
  priceTenge: number;
  qty: number;
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  deliveryMethod: string;
  address: string;
  comment: string;
  totalTenge: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

const CATEGORY_KZ: Record<string, string> = {
  "Набор веса": "Салмақ қосу",
  "Миски и парфюмерия": "Мисктер мен парфюмерия",
  "Разное": "Басқа",
  "Похудение": "Арықтау",
  "Красота": "Сұлулық",
  "Здоровье": "Денсаулық",
  "Хиты": "Хиттер",
  "iHerb Витамины": "iHerb витаминдері",
  "Мужское здоровье": "Ерлер денсаулығы",
  "Женское здоровье": "Әйелдер денсаулығы",
  "Для мусульман": "Мұсылмандарға",
  "Натуральные продукты": "Табиғи өнімдер",
  "Новинки": "Жаңалықтар",
};

export const DEFAULT_SETTINGS: ShopSettings = {
  storeName: "MUSLIM SHOP",
  taglineRu: "Красота. Здоровье. Вера.",
  taglineKz: "Сұлулық. Денсаулық. Сенім.",
  subtitleRu: "Премиальные товары для здоровья, красоты и повседневной жизни.",
  subtitleKz: "Денсаулық, сұлулық және күнделікті өмірге арналған премиум өнімдер.",
  city: "Атырау",
  address: "г. Атырау, ТД «Дина рынок», бутик №24",
  boutiqueNumber: "Бутик №24",
  workingHoursRu: "Ежедневно с 10:00 до 19:00",
  workingHoursKz: "Күн сайын сағат 10:00-ден 19:00-ге дейін",
  currency: "₸",
  instagram: "@MUSLIIM_SHOP06",
  whatsappNumber: "77781754241",
  pickupInfoRu: "г. Атырау, Бутик №24. Выдача заказов ежедневно с 10:00 до 20:30.",
  pickupInfoKz: "Атырау қ., №24 бутик. Тапсырыстарды күн сайын 10:00-ден 20:30-ға дейін алып кетуге болады.",
  deliveryInfoRu: "Быстрая доставка по Атырау. По Казахстану — Казпочта / СДЭК.",
  deliveryInfoKz: "Атырау қаласы бойынша жылдам жеткізу. Қазақстан бойынша Қазпошта / СДЭК.",
};

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const num = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};
const bool = (value: unknown): boolean => value === true;

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0)
    : [];
}

export function cleanTitle(raw: string): string {
  return raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .replace(/[•·▪◦]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function mapProduct(docId: string, data: DocumentData): RawProduct {
  const logicalId = text(data.id) || docId;
  const old = data.oldPrice;
  return {
    id: logicalId,
    docId,
    titleRu: text(data.titleRu) || docId,
    titleKz: text(data.titleKz),
    descriptionRu: text(data.descriptionRu ?? data.description),
    descriptionKz: text(data.descriptionKz),
    specsRu: text(data.specsRu),
    specsKz: text(data.specsKz),
    price: num(data.price),
    oldPrice: old === null || old === undefined || old === "" ? null : num(old),
    categoryId: text(data.categoryId),
    images: strings(data.images),
    inStock: data.inStock === undefined ? true : bool(data.inStock),
    isNew: bool(data.isNew),
    isHit: bool(data.isHit),
    isSale: bool(data.isSale),
    sku: text(data.sku),
    createdAt: text(data.createdAt),
  };
}

export function mapCategory(docId: string, data: DocumentData): RawCategory {
  const nameRu = text(data.nameRu) || docId;
  return {
    id: text(data.id) || docId,
    nameRu,
    nameKz: text(data.nameKz) || CATEGORY_KZ[nameRu] || "",
    icon: text(data.icon),
    order: num(data.order),
  };
}

// Local cache keys for offline persistence and fast responsiveness
const LOCAL_PRODUCTS_KEY = "ms_local_products_v2";
const LOCAL_CATEGORIES_KEY = "ms_local_categories_v2";
const LOCAL_ORDERS_KEY = "ms_local_orders_v2";
const LAST_FETCH_TIME_KEY = "ms_last_fetch_time_v2";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL to protect Firebase quota

export function getCachedStoreData(): {
  products: RawProduct[];
  categories: RawCategory[];
  settings: ShopSettings;
} {
  let products = [...INITIAL_PRODUCTS];
  let categories = [...INITIAL_CATEGORIES];
  let settings = { ...DEFAULT_SETTINGS };

  if (typeof window !== "undefined") {
    try {
      const cachedProds = window.localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        if (Array.isArray(parsed) && parsed.length > 0) products = parsed;
      }
      const cachedCats = window.localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (cachedCats) {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed) && parsed.length > 0) categories = parsed;
      }
    } catch {
      // ignore
    }
  }
  return { products, categories, settings };
}

export async function loadStoreData(forceRefresh = false): Promise<{
  products: RawProduct[];
  categories: RawCategory[];
  settings: ShopSettings;
}> {
  const cached = getCachedStoreData();
  const lastFetch =
    typeof window !== "undefined"
      ? Number(window.localStorage.getItem(LAST_FETCH_TIME_KEY) || 0)
      : 0;
  const isFresh = Date.now() - lastFetch < CACHE_TTL_MS;

  // If cache is fresh and not forced, return immediately with zero network latency
  if (!forceRefresh && isFresh && cached.products.length > 0) {
    return cached;
  }

  let products = cached.products;
  let categories = cached.categories;
  let settings: ShopSettings = cached.settings;

  try {
    const db = getFirebaseClientFirestore();
    const [productSnapshot, categorySnapshot, settingsSnapshot] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "categories")),
      getDoc(doc(db, "settings", "general")),
    ]);

    if (!productSnapshot.empty) {
      products = productSnapshot.docs.map((entry) => mapProduct(entry.id, entry.data()));
    }
    if (!categorySnapshot.empty) {
      categories = categorySnapshot.docs.map((entry) => mapCategory(entry.id, entry.data()));
    }
    if (settingsSnapshot.exists()) {
      const raw = settingsSnapshot.data();
      for (const key of Object.keys(settings) as (keyof ShopSettings)[]) {
        const value = raw[key];
        if (typeof value === "string" && value.trim()) (settings as any)[key] = value.trim();
      }
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAST_FETCH_TIME_KEY, String(Date.now()));
      window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
      window.localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    }
  } catch (err) {
    console.warn("Firestore quiet sync:", err);
  }

  products.sort(
    (a, b) =>
      Number(b.isHit) - Number(a.isHit) || Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
  categories.sort((a, b) => a.order - b.order || a.nameRu.localeCompare(b.nameRu, "ru"));
  settings.address = settings.address.replace(/\s*,\s*,+/g, ",");

  return { products, categories, settings };
}

export function productSlug(product: RawProduct): string {
  return slugify(cleanTitle(product.titleRu)) || product.docId;
}

export function categorySlug(category: RawCategory): string {
  return slugify(category.nameRu) || category.id;
}

export function parseSpecs(raw: string): { name: string; value: string }[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(":");
      return index > 0
        ? { name: line.slice(0, index).trim(), value: line.slice(index + 1).trim() }
        : { name: "Характеристика", value: line };
    });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/jpeg";
  const bytes = atob(encoded);
  const array = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) array[index] = bytes.charCodeAt(index);
  return new Blob([array], { type: mime });
}

export async function uploadProductPhotos(productId: string, dataUrls: string[]): Promise<string[]> {
  const urls: string[] = [];
  try {
    const storage = getFirebaseClientStorage();
    for (const [index, dataUrl] of dataUrls.entries()) {
      if (!dataUrl.startsWith("data:")) {
        urls.push(dataUrl);
        continue;
      }
      const blob = dataUrlToBlob(dataUrl);
      const fileRef = ref(storage, `products/${productId}/${Date.now()}-${index}.jpg`);
      await uploadBytes(fileRef, blob, { contentType: blob.type });
      urls.push(await getDownloadURL(fileRef));
    }
  } catch (err) {
    console.warn("Storage upload note (using direct data URLs if needed):", err);
    // If Firebase Storage is not yet enabled or restricted, dataUrls still work cleanly!
    return dataUrls;
  }
  return urls;
}

export async function saveProduct(
  productId: string | null,
  values: Omit<RawProduct, "id" | "docId">,
  newImages: string[],
): Promise<string> {
  const targetId = productId || `prod-${Date.now()}`;
  const uploaded = newImages.length > 0 ? await uploadProductPhotos(targetId, newImages) : [];
  const fullImages = [...values.images, ...uploaded].slice(0, 8);

  const productData: RawProduct = {
    ...values,
    id: targetId,
    docId: targetId,
    images: fullImages,
    createdAt: values.createdAt || new Date().toISOString(),
  };

  try {
    const db = getFirebaseClientFirestore();
    await setDoc(doc(db, "products", targetId), productData, { merge: true });
  } catch (err) {
    console.warn("Firestore save product fallback to local cache:", err);
  }

  // Update local cache
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LOCAL_PRODUCTS_KEY);
      let list: RawProduct[] = stored ? JSON.parse(stored) : [...INITIAL_PRODUCTS];
      const idx = list.findIndex((p) => p.docId === targetId || p.id === targetId);
      if (idx >= 0) {
        list[idx] = productData;
      } else {
        list.unshift(productData);
      }
      window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  return targetId;
}

export async function removeProduct(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(getFirebaseClientFirestore(), "products", docId));
  } catch (err) {
    console.warn("Firestore removeProduct note:", err);
  }
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (stored) {
        const list: RawProduct[] = JSON.parse(stored);
        window.localStorage.setItem(
          LOCAL_PRODUCTS_KEY,
          JSON.stringify(list.filter((p) => p.docId !== docId && p.id !== docId))
        );
      }
    } catch {
      // ignore
    }
  }
}

export async function setProductStock(docId: string, inStock: boolean): Promise<void> {
  try {
    await updateDoc(doc(getFirebaseClientFirestore(), "products", docId), {
      inStock,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore setProductStock note:", err);
  }
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (stored) {
        const list: RawProduct[] = JSON.parse(stored);
        const item = list.find((p) => p.docId === docId || p.id === docId);
        if (item) item.inStock = inStock;
        window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }
}

export async function loadOrders(): Promise<StoreOrder[]> {
  let orders: StoreOrder[] = [];
  try {
    const snapshot = await getDocs(collection(getFirebaseClientFirestore(), "orders"));
    if (!snapshot.empty) {
      orders = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          orderNumber: text(data.orderNumber) || entry.id,
          customerName: text(data.customerName),
          phone: text(data.phone),
          city: text(data.city),
          deliveryMethod: text(data.deliveryMethod),
          address: text(data.address),
          comment: text(data.comment),
          totalTenge: num(data.totalTenge),
          status: text(data.status) || "new",
          createdAt: text(data.createdAt),
          items: Array.isArray(data.items) ? data.items : [],
        } satisfies StoreOrder;
      });
    }
  } catch (err) {
    console.warn("Firestore loadOrders note:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem(LOCAL_ORDERS_KEY);
      if (cached) {
        const localList: StoreOrder[] = JSON.parse(cached);
        const map = new Map<string, StoreOrder>();
        orders.forEach((o) => map.set(o.id, o));
        localList.forEach((o) => {
          if (!map.has(o.id)) map.set(o.id, o);
        });
        orders = Array.from(map.values());
      }
    } catch {
      // ignore
    }
  }

  return orders.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function saveOrder(order: StoreOrder): Promise<void> {
  try {
    await setDoc(doc(getFirebaseClientFirestore(), "orders", order.id), order);
  } catch (err) {
    console.warn("Firestore saveOrder note:", err);
  }
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem(LOCAL_ORDERS_KEY);
      const list: StoreOrder[] = cached ? JSON.parse(cached) : [];
      list.unshift(order);
      window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    await updateDoc(doc(getFirebaseClientFirestore(), "orders", orderId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Firestore updateOrderStatus note:", err);
  }
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage.getItem(LOCAL_ORDERS_KEY);
      if (cached) {
        const list: StoreOrder[] = JSON.parse(cached);
        const o = list.find((x) => x.id === orderId);
        if (o) o.status = status;
        window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }
}
