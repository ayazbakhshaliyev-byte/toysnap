import { useState } from "react";
import { validateGuestName } from "../lib/nameValidation";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { publicPhotoUrl } from "../lib/supabaseClient";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Entry({ event, onSubmit }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = name.trim().length >= 2 && !submitting;
  const coverUrl = event?.cover_photo_path ? publicPhotoUrl(event.cover_photo_path) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const check = validateGuestName(name);
    if (!check.valid) {
      setError(t(check.reason));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(t("entry.saveError"));
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`min-h-screen bg-ivory flex flex-col items-center px-6 ${
        coverUrl ? "pt-6 pb-12" : "justify-center"
      }`}
    >
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {coverUrl && (
        <div className="w-full max-w-sm mb-8 animate-fade-up">
          <div className="w-full h-[68vh] max-h-[640px] min-h-[380px] rounded-3xl overflow-hidden bg-warm-beige shadow-soft-hover">
            <img
              src={coverUrl}
              alt={event?.title || ""}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-sm animate-fade-up">
        <p className="text-center text-sage tracking-[0.25em] text-xs uppercase mb-3">
          {event?.title}
        </p>
        <h1 className="font-serif italic text-4xl text-slate text-center mb-2">
          {t("entry.title")}
        </h1>
        <p className="text-center text-slate/60 font-sans font-light text-sm mb-10">
          {t("entry.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate/60 mb-2">
              {t("entry.label")}
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
            <p className="mt-2 text-xs text-slate/40 font-sans">{t("entry.helper")}</p>
          </div>

          {error && <p className="text-sm text-dusty-rose text-center">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-14 rounded-lg bg-dusty-rose text-white font-sans tracking-wide
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-[#c79494] transition-colors"
          >
            {submitting ? t("entry.submitting") : t("entry.submit")}
          </button>

          <p className="text-center text-xs text-slate/40 font-sans">{t("entry.footer")}</p>
        </form>
      </div>
    </div>
  );
}
