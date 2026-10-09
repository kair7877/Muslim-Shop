import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RouterContextValue = {
  pathname: string;
  search: string;
  push: (href: string) => void;
  replace: (href: string) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

const KNOWN_ROUTES = [
  "catalog",
  "category",
  "product",
  "cart",
  "checkout",
  "order",
  "namaz",
  "about",
  "contacts",
  "admin",
];

export function getBasePath(): string {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts.length > 0 && !KNOWN_ROUTES.includes(parts[0].toLowerCase())) {
    return "/" + parts[0];
  }
  return "";
}

function stripBasePath(pathname: string): string {
  const base = getBasePath();
  if (base && pathname.startsWith(base)) {
    const stripped = pathname.slice(base.length);
    return stripped.startsWith("/") ? stripped : "/" + stripped;
  }
  return pathname;
}

export function addBasePath(href: string): string {
  const base = getBasePath();
  if (!base) return href;
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }
  if (href.startsWith(base)) return href;
  const clean = href.startsWith("/") ? href : "/" + href;
  return `${base}${clean}`;
}

function parseHref(href: string): { pathname: string; search: string } {
  try {
    const url = new URL(href, window.location.origin);
    return { pathname: url.pathname, search: url.search };
  } catch {
    const [pathname, search = ""] = href.split("?");
    return { pathname, search: search ? `?${search}` : "" };
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window === "undefined") {
      return { pathname: "/", search: "" };
    }
    const rawPath = window.location.pathname || "/";
    return {
      pathname: stripBasePath(rawPath),
      search: window.location.search || "",
    };
  });

  useEffect(() => {
    const onPopState = () => {
      const rawPath = window.location.pathname || "/";
      setCurrentUrl({
        pathname: stripBasePath(rawPath),
        search: window.location.search || "",
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const push = useCallback((href: string) => {
    const targetWithBase = addBasePath(href);
    const { pathname, search } = parseHref(targetWithBase);
    window.history.pushState({}, "", targetWithBase);
    setCurrentUrl({ pathname: stripBasePath(pathname), search });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const replace = useCallback((href: string) => {
    const targetWithBase = addBasePath(href);
    const { pathname, search } = parseHref(targetWithBase);
    window.history.replaceState({}, "", targetWithBase);
    setCurrentUrl({ pathname: stripBasePath(pathname), search });
  }, []);

  const value = useMemo(
    () => ({
      pathname: currentUrl.pathname,
      search: currentUrl.search,
      push,
      replace,
    }),
    [currentUrl, push, replace]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    return {
      push: (href: string) => {
        const targetWithBase = addBasePath(href);
        window.history.pushState({}, "", targetWithBase);
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
      replace: (href: string) => {
        const targetWithBase = addBasePath(href);
        window.history.replaceState({}, "", targetWithBase);
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
    };
  }
  return { push: ctx.push, replace: ctx.replace };
}

export function usePathname(): string {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    const raw = typeof window !== "undefined" ? window.location.pathname : "/";
    return stripBasePath(raw);
  }
  return ctx.pathname;
}

export function useSearchParams(): URLSearchParams {
  const ctx = useContext(RouterContext);
  const searchStr = ctx ? ctx.search : typeof window !== "undefined" ? window.location.search || "" : "";
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, onClick, children, ...props },
  ref
) {
  const { push } = useRouter();
  const fullHref = addBasePath(href);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey &&
      !props.target &&
      href.startsWith("/")
    ) {
      e.preventDefault();
      push(href);
    }
  };

  return (
    <a ref={ref} href={fullHref} onClick={handleClick} {...props}>
      {children}
    </a>
  );
});
