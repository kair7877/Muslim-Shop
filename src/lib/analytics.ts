import { doc, setDoc, getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { getFirebaseClientFirestore } from "./firebaseClient";

export type VisitorSession = {
  id: string;
  visitedAt: string;
  city: string;
  country: string;
  ipMasked?: string;
  device: string;
  viewedProducts: {
    id: string;
    name: string;
    viewedAt: string;
  }[];
  lastActive: string;
};

const VISITOR_ID_KEY = "ms_visitor_id_v1";
const LOCAL_ANALYTICS_KEY = "ms_local_analytics_v1";

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = "vis-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    window.localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "Desktop";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "Android телефон";
  if (/iphone|ipad|ipod/i.test(ua)) return "iPhone / iOS";
  if (/mobile/i.test(ua)) return "Мобильный";
  if (/windows/i.test(ua)) return "Windows ПК";
  if (/macintosh/i.test(ua)) return "MacBook / Mac";
  return "ПК / Браузер";
}

function detectCityFallback(): string {
  if (typeof Intl === "undefined") return "Атырау";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Atyrau") || tz.includes("Aqtau") || tz.includes("Oral") || tz.includes("Aktau")) {
      return "Атырау";
    }
    if (tz.includes("Almaty")) return "Алматы";
    if (tz.includes("Astana") || tz.includes("Qyzylorda")) return "Астана";
    return "Казахстан";
  } catch {
    return "Атырау";
  }
}

let sessionInitPromise: Promise<VisitorSession> | null = null;
let currentSession: VisitorSession | null = null;

export async function initVisitorSession(): Promise<VisitorSession> {
  if (currentSession) return currentSession;
  if (sessionInitPromise) return sessionInitPromise;

  sessionInitPromise = (async () => {
    const id = getVisitorId();
    const now = new Date().toISOString();
    const device = detectDevice();
    let city = detectCityFallback();
    let country = "Казахстан";

    // Try fetching accurate city from lightweight fast IP lookup
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.city) city = data.city;
        if (data.country_name) country = data.country_name;
      }
    } catch {
      // Fallback already assigned
    }

    // Load existing session from local storage if available
    let storedProducts: VisitorSession["viewedProducts"] = [];
    try {
      const raw = window.localStorage.getItem(`ms_session_${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.viewedProducts)) {
          storedProducts = parsed.viewedProducts;
        }
      }
    } catch {
      // ignore
    }

    const session: VisitorSession = {
      id,
      visitedAt: now,
      city,
      country,
      device,
      viewedProducts: storedProducts,
      lastActive: now,
    };

    currentSession = session;
    saveSession(session);
    return session;
  })();

  return sessionInitPromise;
}

export async function trackProductView(productId: string, productName: string) {
  const session = await initVisitorSession();
  const now = new Date().toISOString();

  // Don't duplicate if viewed in the last 10 seconds
  const exists = session.viewedProducts.find(
    (p) => p.id === productId && Date.now() - new Date(p.viewedAt).getTime() < 10000
  );

  if (!exists) {
    session.viewedProducts.unshift({
      id: productId,
      name: productName,
      viewedAt: now,
    });
    // keep max 20 viewed products per visitor
    session.viewedProducts = session.viewedProducts.slice(0, 20);
  }

  session.lastActive = now;
  saveSession(session);
}

function saveSession(session: VisitorSession) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`ms_session_${session.id}`, JSON.stringify(session));

      // Append to local analytics feed
      const rawFeed = window.localStorage.getItem(LOCAL_ANALYTICS_KEY);
      let feed: VisitorSession[] = rawFeed ? JSON.parse(rawFeed) : [];
      const idx = feed.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        feed[idx] = session;
      } else {
        feed.unshift(session);
      }
      feed = feed.slice(0, 100);
      window.localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(feed));
    } catch {
      // ignore
    }
  }

  // Save to Firestore asynchronously
  try {
    const db = getFirebaseClientFirestore();
    setDoc(doc(db, "visitor_sessions", session.id), session, { merge: true }).catch(() => {});
  } catch {
    // ignore
  }
}

export async function getVisitorSessions(): Promise<VisitorSession[]> {
  const sessionsMap = new Map<string, VisitorSession>();

  // 1. Try from Firestore
  try {
    const db = getFirebaseClientFirestore();
    const snap = await getDocs(
      query(collection(db, "visitor_sessions"), orderBy("lastActive", "desc"), limit(60))
    );
    if (!snap.empty) {
      snap.docs.forEach((d) => {
        const data = d.data() as VisitorSession;
        sessionsMap.set(data.id || d.id, { ...data, id: data.id || d.id });
      });
    }
  } catch (err) {
    console.warn("Firestore analytics fetch note:", err);
  }

  // 2. Merge with local storage cache
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(LOCAL_ANALYTICS_KEY);
      if (raw) {
        const localList: VisitorSession[] = JSON.parse(raw);
        localList.forEach((s) => {
          if (!sessionsMap.has(s.id)) {
            sessionsMap.set(s.id, s);
          }
        });
      }
    } catch {
      // ignore
    }
  }

  return Array.from(sessionsMap.values()).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );
}
