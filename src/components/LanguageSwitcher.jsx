import { LANGUAGES } from "../lib/i18n/translations";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex gap-1 ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-sans tracking-wide transition-colors ${
            lang === l.code
              ? "bg-slate text-ivory"
              : "bg-champagne/60 text-slate/50 hover:text-slate/80"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
