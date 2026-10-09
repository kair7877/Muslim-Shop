import { useEffect, type ReactNode } from "react";
import { Link, RouterProvider, usePathname } from "@/lib/router";
import { CartProvider } from "@/components/CartProvider";
import { ClientProviders } from "@/components/ClientProviders";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { initVisitorSession } from "@/lib/analytics";

import { HomeView } from "@/views/HomeView";
import { CatalogView } from "@/views/CatalogView";
import { CategoryView } from "@/views/CategoryView";
import { ProductView } from "@/views/ProductView";
import { CartViewPage } from "@/views/CartViewPage";
import { CheckoutView } from "@/views/CheckoutView";
import { OrderView } from "@/views/OrderView";
import { NamazView } from "@/views/NamazView";
import { AboutView } from "@/views/AboutView";
import { ContactsView } from "@/views/ContactsView";
import { AdminLoginView } from "@/views/AdminLoginView";
import { AdminDashboardView } from "@/views/AdminDashboardView";
import { AdminProductsView } from "@/views/AdminProductsView";
import { AdminProductNewView } from "@/views/AdminProductNewView";
import { AdminProductEditView } from "@/views/AdminProductEditView";
import { AdminCategoriesView } from "@/views/AdminCategoriesView";
import { AdminOrdersView } from "@/views/AdminOrdersView";
import { AdminOrderSingleView } from "@/views/AdminOrderSingleView";
import { AdminAnalyticsView } from "@/views/AdminAnalyticsView";

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist pb-16">
      <AdminNav />
      <div className="ms-container pt-6">{children}</div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="ms-container py-14 md:py-20">
      <div className="mx-auto max-w-2xl rounded border border-line bg-white p-7 text-center md:p-10 shadow-xs">
        <p className="text-[14px] font-extrabold uppercase tracking-[0.12em] text-muted">404</p>
        <h1 className="mt-3 text-[26px] font-black leading-tight text-ink md:text-[34px]">
          Страница или товар не найдены
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-graphite md:text-[18px]">
          Возможно, товар был перемещен или ссылка устарела. Откройте каталог — там все актуальные
          товары с ценами и наличием.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/catalog/" className="ms-btn ms-btn-primary w-full">
            Открыть каталог
          </Link>
          <Link href="/" className="ms-btn ms-btn-outline w-full">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function MainRouter() {
  const pathname = usePathname();
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  useEffect(() => {
    initVisitorSession();
  }, []);

  // Admin routes
  if (normalized === "/admin/login/") {
    return (
      <div className="min-h-screen bg-mist flex flex-col justify-center">
        <AdminLoginView />
      </div>
    );
  }

  if (normalized.startsWith("/admin/")) {
    return (
      <AdminGuard>
        <AdminLayout>
          {normalized === "/admin/" && <AdminDashboardView />}
          {normalized === "/admin/analytics/" && <AdminAnalyticsView />}
          {normalized === "/admin/products/" && <AdminProductsView />}
          {normalized === "/admin/products/new/" && <AdminProductNewView />}
          {normalized === "/admin/products/edit/" && <AdminProductEditView />}
          {normalized === "/admin/categories/" && <AdminCategoriesView />}
          {normalized === "/admin/orders/" && <AdminOrdersView />}
          {normalized === "/admin/orders/view/" && <AdminOrderSingleView />}
          {![
            "/admin/",
            "/admin/products/",
            "/admin/products/new/",
            "/admin/products/edit/",
            "/admin/categories/",
            "/admin/orders/",
            "/admin/orders/view/",
          ].includes(normalized) && <AdminDashboardView />}
        </AdminLayout>
      </AdminGuard>
    );
  }

  // Storefront routes
  let ViewComponent = <HomeView />;
  if (normalized === "/" || normalized === "") {
    ViewComponent = <HomeView />;
  } else if (normalized === "/catalog/") {
    ViewComponent = <CatalogView />;
  } else if (normalized === "/category/") {
    ViewComponent = <CategoryView />;
  } else if (normalized === "/product/") {
    ViewComponent = <ProductView />;
  } else if (normalized === "/cart/") {
    ViewComponent = <CartViewPage />;
  } else if (normalized === "/checkout/") {
    ViewComponent = <CheckoutView />;
  } else if (normalized === "/order/") {
    ViewComponent = <OrderView />;
  } else if (normalized === "/namaz/") {
    ViewComponent = <NamazView />;
  } else if (normalized === "/about/") {
    ViewComponent = <AboutView />;
  } else if (normalized === "/contacts/") {
    ViewComponent = <ContactsView />;
  } else {
    ViewComponent = <NotFoundView />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink antialiased">
      <Header />
      <main className="flex-1">{ViewComponent}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <ClientProviders>
        <CartProvider>
          <MainRouter />
        </CartProvider>
      </ClientProviders>
    </RouterProvider>
  );
}
