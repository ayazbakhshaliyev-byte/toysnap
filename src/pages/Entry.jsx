import { useState } from "react";
import { validateGuestName } from "../lib/nameValidation";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { formatEventDate } from "../lib/i18n/translations";
import { publicPhotoUrl } from "../lib/supabaseClient";
import { getPartnerName, getCityName, getMonogramInitials, hasCoupleNames } from "../lib/coupleInfo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import CoupleMonogram from "../components/CoupleMonogram";

export default function Entry({ event, onSubmit }) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = name.trim().length >= 2 && !submitting;
  const coverUrl = event?.cover_photo_path ? publicPhotoUrl(event.cover_photo_path) : null;

  const showCoupleNames = hasCoupleNames(event);
  const partner1 = getPartnerName(event, 1, lang);
  const partner2 = getPartnerName(event, 2, lang);
  const { initial1, initial2 } = getMonogramInitials(event);
  const dateCityLine = formatEventDate(event?.wedding_date, lang, getCityName(event, lang));

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
    <div className="paper-texture min-h-screen relative">
      <div className="absolute top-4 right-5 z-10">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col items-center text-center px-8 pt-16 pb-11 min-h-screen box-border">
        {showCoupleNames ? (
          <CoupleMonogram initial1={initial1} initial2={initial2} variant="full" />
        ) : (
          <span className="text-gold text-3xl">✦</span>
        )}

        {coverUrl && (
          <div className="w-full max-w-sm mt-6 p-2.5 bg-paper border border-gold/50 shadow-soft rounded-[10px]">
            <div className="border border-gold/40 aspect-[10/9] overflow-hidden bg-champagne/40">
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {showCoupleNames ? (
          <h1 className="font-serif italic font-medium text-[42px] leading-[1.05] text-ink mt-7">
            {partner1}
            <span className="block font-script not-italic text-3xl text-gold leading-[0.8] my-1">&amp;</span>
            {partner2}
          </h1>
        ) : (
          <h1 className="font-serif italic font-medium text-[42px] leading-[1.05] text-ink mt-7">
            {event?.title}
          </h1>
        )}

        {dateCityLine && (
          <div className="flex items-center gap-3 mt-6">
            <span className="w-8 h-px bg-gold/60" />
            <span className="font-sans text-[9.5px] font-semibold tracking-[0.2em] text-ink-soft uppercase">
              {dateCityLine}
            </span>
            <span className="w-8 h-px bg-gold/60" />
          </div>
        )}

        <p className="font-serif italic text-lg leading-snug text-ink-soft mt-6 px-1">
          {t("entry.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm mt-9 text-left">
          <label className="block font-sans text-[9.5px] font-semibold tracking-[0.2em] text-dim uppercase">
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
            placeholder={t("entry.namePlaceholder")}
            className="w-full bg-transparent border-0 border-b border-gold/50 py-2.5 mt-1.5
                       font-serif italic text-xl text-ink placeholder:text-ink/25
                       focus:outline-none focus:border-gold transition-colors"
          />
          <p className="mt-1.5 font-sans text-[11px] text-gold/90">{t("entry.helper")}</p>

          {error && <p className="mt-3 text-sm font-sans text-blush text-center">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 w-full py-[15px] bg-transparent border border-gold text-ink
                       font-sans text-[10.5px] font-semibold tracking-[0.22em] uppercase
                       transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed
                       hover:enabled:bg-forest hover:enabled:text-paper hover:enabled:border-forest"
          >
            {submitting ? t("entry.submitting") : t("entry.submit")}
          </button>

          <p className="mt-6 text-center font-sans text-[10px] tracking-wide text-dim/70">
            {t("entry.footer")}
          </p>
        </form>
      </div>
    </div>
  );
}
