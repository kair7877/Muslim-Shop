import { useState } from "react";
import { Link, useRouter } from "@/lib/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebaseClient";

export function AdminLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    // Secret master access for the shop owner
    if (
      (password === "1234" || password === "admin123" || password === "muslim2026") &&
      (email === "admin" || email.includes("@"))
    ) {
      window.localStorage.setItem("ms_admin_logged_in", "true");
      setBusy(false);
      router.push("/admin/");
      window.location.reload();
      return;
    }

    try {
      const auth = getFirebaseClientAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      window.localStorage.setItem("ms_admin_logged_in", "true");
      router.push("/admin/");
      window.location.reload();
    } catch {
      setError("Неверный логин или пароль.");
      setBusy(false);
    }
  }

  return (
    <div className="ms-container py-12 md:py-20">
      <div className="mx-auto max-w-md rounded border border-line bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h1 className="text-[22px] font-black uppercase text-ink">
            Вход в систему
          </h1>
          <span className="text-xl">🔒</span>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <label className="ms-label" htmlFor="email">
              Логин / Email
            </label>
            <input
              id="email"
              type="text"
              className="ms-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Логин"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="ms-label" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className="ms-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button disabled={busy} className="ms-btn ms-btn-primary w-full mt-2">
            {busy ? "Проверка…" : "ВОЙТИ"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-line text-center">
          <Link href="/" className="text-xs text-muted hover:text-ink font-semibold">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
