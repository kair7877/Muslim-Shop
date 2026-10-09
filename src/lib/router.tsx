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
    return { pathname: window.location.pathname || "/", search: window.location.search || "" };
  });

  useEffect(() => {
    const onPopState = () => {
      setCurrentUrl({
        pathname: window.location.pathname || "/",
        search: window.location.search || "",
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const push = useCallback((href: string) => {
    const { pathname, search } = parseHref(href);
    window.history.pushState({}, "", href);
    setCurrentUrl({ pathname, search });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const replace = useCallback((href: string) => {
    const { pathname, search } = parseHref(href);
    window.history.replaceState({}, "", href);
    setCurrentUrl({ pathname, search });
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
        window.history.pushState({}, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
      replace: (href: string) => {
        window.history.replaceState({}, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      },
    };
  }
  return { push: ctx.push, replace: ctx.replace };
}

export function usePathname(): string {
  const ctx = useContext(RouterContext);
  if (!ctx) return window.location.pathname || "/";
  return ctx.pathname;
}

export function useSearchParams(): URLSearchParams {
  const ctx = useContext(RouterContext);
  const searchStr = ctx ? ctx.search : window.location.search || "";
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
    <a ref={ref} href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
});
