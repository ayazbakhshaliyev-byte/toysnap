import { useState } from "react";
import { validateGuestName } from "../lib/nameValidation";

export default function Entry({ event, onSubmit }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = name.trim().length >= 2 && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const check = validateGuestName(name);
    if (!check.valid) {
      setError(check.reason);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError("Не получилось сохранить имя. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="text-center text-sage tracking-[0.25em] text-xs uppercase mb-3">
          {event?.title}
        </p>
        <h1 className="font-serif italic text-4xl text-slate text-center mb-2">
          Добро пожаловать ✦
        </h1>
        <p className="text-center text-slate/60 font-sans font-light text-sm mb-10">
          Прежде чем войти в галерею — представьтесь
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate/60 mb-2">
              Ваше имя и фамилия
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Alexander Smith"
              className="w-full h-14 px-4 rounded-lg bg-warm-beige border border-champagne
                         font-sans text-slate placeholder:text-slate/30
                         focus:outline-none focus:ring-2 focus:ring-dusty-rose/50 transition"
            />
            <p className="mt-2 text-xs text-slate/40 font-sans">
              Только латиница (английские или азербайджанские буквы)
            </p>
          </div>

          {error && <p className="text-sm text-dusty-rose text-center">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-14 rounded-lg bg-dusty-rose text-white font-sans tracking-wide
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-[#c79494] transition-colors"
          >
            {submitting ? "Входим…" : "Войти в галерею →"}
          </button>

          <p className="text-center text-xs text-slate/40 font-sans">
            Имя сохранится в этом браузере
          </p>
        </form>
      </div>
    </div>
  );
}
