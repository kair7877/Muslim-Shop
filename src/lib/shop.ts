export const SHOP = {
  name: "MUSLIM SHOP",
  tagline: "АТЫРАУ • РЫНОК ДИНА • БУТИК 24",
  city: "Атырау",
  addressLine: "пр. Султана Бейбарыса, 45а/5",
  addressFull: "пр. Султана Бейбарыса, 45а/5, Атырау, Казахстан",
  market: "Рынок Дина, бутик 24",
  phone: "+7 778 175 42 41",
  phoneHref: "tel:+77781754241",
  whatsappHref: "https://wa.me/77781754241",
  telegramHref: "https://t.me/muslim_shop06",
  instagramHref:
    "https://www.instagram.com/musliim_shop06?stkn=dnAzejJ2cm5nOXNi",
  tiktokHref: "https://www.tiktok.com/@muslim_shop06?_r=1&_t=ZS-9AFgdLAOcZ2",
  instagramHandle: "@musliim_shop06",
  tiktokHandle: "@muslim_shop06",
  telegramHandle: "@muslim_shop06",
  hours: "Ежедневно 09:00 – 19:00",
} as const;

const SPACE_RE = /\s+/g;

/** 3500 -> "3 500 ₸" */
export function formatTenge(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return `${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸`;
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ә: "a", ғ: "g", қ: "q",
    ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
  };
  return input
    .toLowerCase()
    .split("")
    .map((char) => (char in map ? map[char] : char))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(SPACE_RE, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function statusLabel(status: string): string {
  if (status === "in_stock") return "В наличии";
  if (status === "out_of_stock") return "Нет в наличии";
  return "Скрыт";
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "new":
      return "Новый";
    case "confirmed":
      return "Подтверждён";
    case "delivered":
      return "Выполнен";
    case "cancelled":
      return "Отменён";
    default:
      return status;
  }
}

export function pluralizeProducts(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "товар";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "товара";
  return "товаров";
}
