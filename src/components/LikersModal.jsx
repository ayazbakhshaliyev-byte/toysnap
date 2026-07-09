import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getInitials } from "../lib/initials";

export default function LikersModal({ photoId, eventCode, onClose }) {
  const { t } = useLanguage();
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("likes")
        .select("guest_id, created_at, guests(full_name)")
        .eq("photo_id", photoId)
        .order("created_at", { ascending: false });
      setLikers(data || []);
      setLoading(false);
    })();
  }, [photoId]);

  return (
    <div
      className="fixed inset-0 bg-ink/45 flex items-end justify-center sm:items-center z-[60] animate-fade-up"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[74%] sm:max-w-sm sm:max-h-[70vh] flex flex-col bg-sheet rounded-t-[22px] sm:rounded-[16px] shadow-soft-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none px-5 pt-4 pb-3 border-b border-gold/25">
          <div className="w-[42px] h-1 rounded-full bg-gold/40 mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <span className="font-sans text-[9px] font-semibold tracking-[0.24em] uppercase text-gold">
              {t("likers.title")} {likers.length > 0 && `· ${likers.length}`}
            </span>
            <button onClick={onClose} className="text-dim" aria-label="close">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-1.5 pb-6">
          {loading ? (
            <p className="py-4 font-sans text-dim text-sm">{t("likers.loading")}</p>
          ) : likers.length === 0 ? (
            <p className="py-4 font-sans text-dim text-sm">{t("likers.empty")}</p>
          ) : (
            likers.map((l) => {
              const name = l.guests?.full_name || t("photoCard.guestFallback");
              return (
                <div key={l.guest_id} className="flex items-center gap-3 py-2.5 border-b border-gold/15">
                  <span className="flex-none w-[38px] h-[38px] rounded-full border border-gold/55 flex items-center justify-center bg-white">
                    <span className="font-serif text-sm text-ink">{getInitials(name)}</span>
                  </span>
                  {eventCode ? (
                    <Link
                      to={`/event/${eventCode}/guest/${l.guest_id}`}
                      onClick={onClose}
                      className="flex-1 min-w-0 truncate font-serif italic text-lg text-ink"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="flex-1 min-w-0 truncate font-serif italic text-lg text-ink">{name}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
