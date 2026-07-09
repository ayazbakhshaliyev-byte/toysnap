import { LANGUAGES } from "../lib/i18n/translations";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex gap-3 ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`pb-[3px] font-sans text-[10px] font-semibold tracking-[0.14em] uppercase border-b transition-colors ${
            lang === l.code
              ? "text-gold border-gold"
              : "text-dim/70 border-transparent hover:text-dim"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
