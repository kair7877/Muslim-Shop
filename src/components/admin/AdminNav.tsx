import { signOut } from "firebase/auth";
import { Link, usePathname, useRouter } from "@/lib/router";
import { getFirebaseClientAuth } from "@/lib/firebaseClient";

const LINKS = [
  { href: "/admin/", label: "Обзор" },
  { href: "/admin/products/", label: "Товары" },
  { href: "/admin/categories/", label: "Категории" },
  { href: "/admin/orders/", label: "Заказы" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await signOut(getFirebaseClientAuth());
    } catch {
      // ignore
    }
    try {
      window.localStorage.removeItem("ms_admin_logged_in");
    } catch {
      // ignore
    }
    router.push("/admin/login/");
  }

  return (
    <div className="border-b border-line bg-white shadow-xs">
      <div className="ms-container flex flex-wrap items-center gap-2 py-3">
        <span className="mr-2 text-[16px] font-black uppercase tracking-[0.04em] text-ink">
          Управление
        </span>
        {LINKS.map((link) => {
          const active =
            link.href === "/admin/" ? pathname === "/admin/" || pathname === "/admin" : pathname.startsWith(link.href.replace(/\/$/, ""));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[4px] px-3.5 py-2 text-[14px] font-bold transition-colors ${
                active ? "bg-ink text-white" : "bg-mist text-graphite hover:bg-line"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/" className="ms-btn ms-btn-outline h-10 px-3.5 text-[13px]">
            Открыть сайт
          </Link>
          <button
            type="button"
            onClick={logout}
            className="ms-btn ms-btn-outline h-10 px-3.5 text-[13px]"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
