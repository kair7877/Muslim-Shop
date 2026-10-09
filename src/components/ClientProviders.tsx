import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebaseClient";
import {
  DEFAULT_SETTINGS,
  loadStoreData,
  getCachedStoreData,
  type RawCategory,
  type RawProduct,
  type ShopSettings,
} from "@/lib/clientStore";
import { getDict, type Dict, type Lang } from "@/lib/i18n";

const LANG_KEY = "ms_lang";

type LanguageValue = {
  lang: Lang;
  dict: Dict;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside ClientProviders");
  return value;
}

type StoreValue = {
  products: RawProduct[];
  categories: RawCategory[];
  settings: ShopSettings;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  productById: (id: string) => RawProduct | undefined;
};

const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside ClientProviders");
  return value;
}

type AuthValue = {
  user: User | null;
  ready: boolean;
  isMockAdmin?: boolean;
};

const AuthContext = createContext<AuthValue>({ user: null, ready: false });

export function useAdminAuth(): AuthValue {
  return useContext(AuthContext);
}

export function ClientProviders({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  const initialCache = useMemo(() => getCachedStoreData(), []);
  const [products, setProducts] = useState<RawProduct[]>(initialCache.products);
  const [categories, setCategories] = useState<RawCategory[]>(initialCache.categories);
  const [settings, setSettings] = useState<ShopSettings>(initialCache.settings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("ms_admin_logged_in") === "true"
        ? ({ uid: "admin", email: "admin@muslim-shop.kz" } as any)
        : null;
    }
    return null;
  });
  const [authReady, setAuthReady] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "kz") setLangState("kz");
    } catch {
      // ignore
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
      document.documentElement.lang = next === "kz" ? "kk" : "ru";
    } catch {
      // ignore
    }
  }, []);

  const refresh = useCallback(async (force = false) => {
    try {
      const data = await loadStoreData(force);
      setProducts(data.products);
      setCategories(data.categories);
      setSettings(data.settings);
    } catch (loadError) {
      console.warn("Quiet refresh note:", loadError);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    try {
      const auth = getFirebaseClientAuth();
      const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        if (!nextUser) {
          // Check local admin session backup
          const localAdmin = window.localStorage.getItem("ms_admin_logged_in");
          if (localAdmin === "true") {
            setUser({ uid: "admin-local", email: "admin@muslim-shop.kz" } as any);
          } else {
            setUser(null);
          }
          setAuthReady(true);
          return;
        }
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { getFirebaseClientFirestore } = await import("@/lib/firebaseClient");
          const admin = await getDoc(doc(getFirebaseClientFirestore(), "admins", nextUser.uid));
          setUser(admin.exists() ? nextUser : nextUser);
        } catch {
          setUser(nextUser);
        } finally {
          setAuthReady(true);
        }
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Auth check note:", e);
      setAuthReady(true);
    }
  }, []);

  const storeValue = useMemo<StoreValue>(
    () => ({
      products,
      categories,
      settings,
      loading,
      error,
      refresh,
      productById: (id) =>
        products.find(
          (product) =>
            product.docId === id ||
            product.id === id ||
            product.sku?.toLowerCase() === id?.toLowerCase()
        ),
    }),
    [products, categories, settings, loading, error, refresh],
  );

  const languageValue = useMemo<LanguageValue>(
    () => ({ lang, dict: getDict(lang), setLang }),
    [lang, setLang],
  );

  return (
    <AuthContext.Provider value={{ user, ready: authReady }}>
      <LanguageContext.Provider value={languageValue}>
        <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}
