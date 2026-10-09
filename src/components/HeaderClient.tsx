import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/lib/router";
import { useCart } from "@/components/CartProvider";
import { useLanguage, useStore } from "@/components/ClientProviders";
import { cleanTitle } from "@/lib/clientStore";
import { formatTenge } from "@/lib/shop";

export function SearchBox({
  placeholder,
  actionLabel,
  hint,
}: {
  placeholder: string;
  actionLabel: string;
  hint: string;
}) {
  const router = useRouter();
  const { products } = useStore();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const query = term.trim().toLowerCase();
  const items =
    query.length < 2
      ? []
      : products
          .filter((item) =>
            [item.titleRu, item.titleKz, item.sku, item.descriptionRu]
              .join(" ")
              .toLowerCase()
              .includes(query)
          )
          .slice(0, 6);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit() {
    setOpen(false);
    router.push(query ? `/catalog/?q=${encodeURIComponent(term.trim())}` : "/catalog/");
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex w-full items-stretch overflow-hidden rounded-[4px] border border-line bg-white focus-within:border-graphite shadow-sm"
        role="search"
      >
        <input
          type="search"
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-12 w-full min-w-0 bg-transparent px-4 text-[16px] font-medium text-ink placeholder:font-normal placeholder:text-muted focus:outline-none md:h-14 md:px-5 md:text-lg"
        />
        <button
          type="submit"
          className="ms-btn ms-btn-primary h-12 shrink-0 rounded-none px-4 text-[15px] md:h-14 md:px-7 md:text-base"
        >
          <span className="hidden sm:inline">{actionLabel}</span>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 sm:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>
        </button>
      </form>
      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[4px] border border-line bg-white shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
          {items.length === 0 ? (
            <p className="px-4 py-4 text-[15px] text-muted">{hint}</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-line overflow-y-auto">
              {items.map((item) => (
                <li key={item.docId}>
                  <Link
                    href={`/product/?id=${encodeURIComponent(item.docId)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-mist"
                  >
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-[3px] border border-line object-cover"
                      />
                    ) : (
                      <span className="h-12 w-12 shrink-0 rounded-[3px] border border-line bg-mist" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">
                        {cleanTitle(item.titleRu)}
                      </span>
                      <span className="block text-[15px] font-bold text-gold">
                        {formatTenge(item.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function CartLink({ label }: { label: string }) {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart/"
      className="relative flex h-12 items-center gap-2 rounded-[4px] bg-ink px-3.5 text-white hover:bg-graphite-soft md:h-14 md:px-5"
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 md:h-7 md:w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      >
        <path d="M3 4h2.2l2.1 10.4a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.55L21 8H6.4" />
        <circle cx="10" cy="20" r="1.4" />
        <circle cx="17.5" cy="20" r="1.4" />
      </svg>
      <span className="hidden text-[14px] font-bold uppercase tracking-wide lg:inline md:text-[15px]">
        {label}
      </span>
      {ready && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[13px] font-extrabold text-white shadow">
          {count}
        </span>
      )}
    </Link>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className="flex h-12 items-center overflow-hidden rounded-[4px] border border-line text-[14px] font-bold md:h-14 md:text-[15px]"
      aria-label="Тіл / Язык"
    >
      <button
        type="button"
        onClick={() => setLang("ru")}
        className={`h-full px-2.5 md:px-3.5 transition-colors ${
          lang === "ru" ? "bg-ink text-white" : "bg-white text-muted hover:text-ink"
        }`}
      >
        RU
      </button>
      <span className="h-5 w-px bg-line" />
      <button
        type="button"
        onClick={() => setLang("kz")}
        className={`h-full px-2.5 md:px-3.5 transition-colors ${
          lang === "kz" ? "bg-ink text-white" : "bg-white text-muted hover:text-ink"
        }`}
      >
        KZ
      </button>
    </div>
  );
}

export function MobileMenu({
  menuLabel,
  categories,
  allLabel,
  extraLinks,
}: {
  menuLabel: string;
  categories: { id: string; name: string; productCount: number }[];
  allLabel: string;
  extraLinks: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 items-center gap-1.5 rounded-[4px] border border-line bg-white px-2.5 text-[14px] font-bold text-ink hover:border-ink md:h-14 md:px-4 md:text-[15px]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="hidden sm:inline">{menuLabel}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <span className="text-[17px] font-extrabold uppercase tracking-wide">MUSLIM SHOP</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-line"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Link
                href="/catalog/"
                onClick={() => setOpen(false)}
                className="block border-b border-line bg-ink px-4 py-3.5 text-[16px] font-extrabold uppercase tracking-wide text-white"
              >
                {allLabel}
              </Link>
              <ul>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/?id=${encodeURIComponent(category.id)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 text-[16px] font-semibold text-ink hover:bg-mist"
                    >
                      <span>{category.name}</span>
                      <span className="text-[14px] font-normal text-muted">{category.productCount}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-4 py-3 bg-mist/50">
                {extraLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 text-[16px] font-semibold text-graphite hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
