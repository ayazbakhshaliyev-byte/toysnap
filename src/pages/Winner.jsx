import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { supabase, publicPhotoUrl } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getInitials } from "../lib/initials";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Winner({ event }) {
  const { t } = useLanguage();
  const [winnerPhoto, setWinnerPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!event.winner_photo_id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("photos")
        .select("*, guests(full_name)")
        .eq("id", event.winner_photo_id)
        .maybeSingle();
      setWinnerPhoto(data);
      setLoading(false);

      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#a9853f", "#dcc1b6", "#f8f4ea"],
      });
    })();
  }, [event.winner_photo_id]);

  if (loading) {
    return <div className="min-h-screen bg-noir" />;
  }

  const authorName = winnerPhoto?.guests?.full_name || "";

  return (
    <div className="min-h-screen bg-noir flex flex-col items-center justify-center px-6 relative animate-fade-up">
      <div className="absolute top-4 right-5">
        <LanguageSwitcher />
      </div>

      <div className="flex items-center gap-3 mb-8">
        <span className="w-8 h-px bg-gold/60" />
        <span className="font-sans text-[9.5px] font-semibold tracking-[0.24em] uppercase text-gold">
          {t("winner.title")}
        </span>
        <span className="w-8 h-px bg-gold/60" />
      </div>

      {!winnerPhoto ? (
        <p className="font-serif italic text-xl text-paper/80 text-center max-w-xs">
          {t("winner.pending")}
        </p>
      ) : (
        <>
          <div className="w-full max-w-sm p-2.5 bg-paper border border-gold/50 shadow-soft-hover">
            <div className="border border-gold/40 overflow-hidden bg-noir-deep">
              <img
                src={publicPhotoUrl(winnerPhoto.image_path)}
                alt={authorName}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 mt-7">
            <span className="w-9 h-9 rounded-full border border-gold flex items-center justify-center bg-noir-deep">
              <span className="font-serif text-xs text-paper">{getInitials(authorName)}</span>
            </span>
            <p className="font-serif italic text-xl text-paper">
              {t("winner.author")} {authorName}
            </p>
          </div>

          <p className="mt-2 font-sans text-[11px] tracking-wide text-dim">
            {winnerPhoto.likes_count} ❤
          </p>
        </>
      )}
    </div>
  );
}
