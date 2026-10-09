import type { RawCategory, RawProduct } from "./clientStore";

export const INITIAL_CATEGORIES: RawCategory[] = [
  { id: "misks", nameRu: "Миски и парфюмерия", nameKz: "Мисктер мен парфюмерия", icon: "✨", order: 1 },
  { id: "health", nameRu: "Здоровье", nameKz: "Денсаулық", icon: "🌿", order: 2 },
  { id: "natural", nameRu: "Натуральные продукты", nameKz: "Табиғи өнімдер", icon: "🍯", order: 3 },
  { id: "vitamins", nameRu: "iHerb Витамины", nameKz: "iHerb витаминдері", icon: "💊", order: 4 },
  { id: "muslim", nameRu: "Для мусульман", nameKz: "Мұсылмандарға", icon: "🕋", order: 5 },
  { id: "beauty", nameRu: "Красота", nameKz: "Сұлулық", icon: "🧴", order: 6 },
  { id: "weight", nameRu: "Набор веса", nameKz: "Салмақ қосу", icon: "💪", order: 7 },
  { id: "slimming", nameRu: "Похудение", nameKz: "Арықтау", icon: "🍃", order: 8 },
  { id: "misc", nameRu: "Разное", nameKz: "Басқа", icon: "📦", order: 9 },
];

// No demo/mock products - only real products from the store owner's database
export const INITIAL_PRODUCTS: RawProduct[] = [];
