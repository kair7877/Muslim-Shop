import type { ReactNode } from "react";
import { Link, usePathname } from "@/lib/router";
import { useAdminAuth } from "@/components/ClientProviders";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, ready } = useAdminAuth();
  const path = usePathname();

  if (path.endsWith("/admin/login/") || path.endsWith("/admin/login")) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="ms-container py-20 text-center">Проверка входа в систему…</div>;
  }

  if (!user) {
    return (
      <div className="ms-container py-20">
        <div className="mx-auto max-w-md rounded border border-line bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">Требуется вход</h1>
          <p className="mt-2 text-muted">
            Войдите через Firebase Authentication или используйте пароль администратора.
          </p>
          <Link href="/admin/login/" className="ms-btn ms-btn-primary mt-6 w-full">
            ВОЙТИ
          </Link>
          <Link href="/" className="ms-btn ms-btn-outline mt-3 w-full">
            Вернуться в магазин
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
