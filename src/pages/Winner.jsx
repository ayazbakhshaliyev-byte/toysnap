import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { supabase, publicPhotoUrl } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";

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
        colors: ["#C9A96E", "#F2E6D9", "#D4A5A5"],
      });
    })();
  }, [event.winner_photo_id]);

  if (loading) {
    return <div className="min-h-screen bg-slate" />;
  }

  if (!winnerPhoto) {
    return (
      <div className="min-h-screen bg-slate flex items-center justify-center px-6">
        <p className="text-champagne font-serif-light text-xl text-center">{t("winner.pending")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate flex flex-col items-center justify-center px-6 animate-fade-up">
      <p className="text-old-gold tracking-[0.3em] text-xs uppercase mb-6">{t("winner.title")}</p>
      <div className="p-2 bg-old-gold rounded-lg shadow-2xl max-w-sm w-full">
        <div className="p-1 bg-slate rounded">
          <img
            src={publicPhotoUrl(winnerPhoto.image_path)}
            alt="Фото-победитель"
            className="w-full rounded"
          />
        </div>
      </div>
      <p className="mt-8 font-serif italic text-2xl text-ivory text-center">
        {t("winner.author")} {winnerPhoto.guests?.full_name}
      </p>
      <p className="mt-2 font-sans text-sm text-champagne/70">
        {winnerPhoto.likes_count} {"❤"}
      </p>
    </div>
  );
}
