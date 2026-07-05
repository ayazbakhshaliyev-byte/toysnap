import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAdminSession } from "../../hooks/useAdminSession";
import AdminDashboard from "./AdminDashboard";

export default function AdminLogin() {
  const { code } = useParams();
  const { loading, user, event, isAdmin, signIn, signUp, signOut, reload } = useAdminSession(code);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(email, password);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-ivory" />;

  if (!event) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-sans text-slate/60">Событие с кодом «{code}» не найдено.</p>
      </div>
    );
  }

  if (user && isAdmin) {
    return <AdminDashboard event={event} onSignOut={signOut} />;
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 gap-4">
        <p className="font-sans text-slate/70 text-center max-w-sm">
          Ваш аккаунт вошёл, но не назначен организатором события «{event.title}». Права
          назначаются вручную в базе данных — см. README.
        </p>
        <button onClick={signOut} className="text-sm text-dusty-rose underline">
          Выйти и попробовать другой аккаунт
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <h1 className="font-serif italic text-3xl text-slate text-center mb-2">
          Кабинет организатора
        </h1>
        <p className="text-center text-slate/50 font-sans text-sm mb-6">{event.title}</p>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-14 px-4 rounded-lg bg-warm-beige border border-champagne font-sans"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-14 px-4 rounded-lg bg-warm-beige border border-champagne font-sans"
        />

        {err && <p className="text-sm text-dusty-rose text-center">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full h-14 rounded-lg bg-slate text-ivory font-sans"
        >
          {mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-sm text-slate/50 underline"
        >
          {mode === "login" ? "Первый раз здесь? Создать аккаунт" : "Уже есть аккаунт? Войти"}
        </button>
      </form>
    </div>
  );
}
