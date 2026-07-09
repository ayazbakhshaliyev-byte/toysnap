import { useState } from "react";
import { Link } from "react-router-dom";
import { publicPhotoUrl, supabase } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import HeartIcon from "./HeartIcon";
import CommentIcon from "./CommentIcon";
import LikersModal from "./LikersModal";
import PhotoLightbox from "./PhotoLightbox";

export default function PhotoCard({ photo, currentGuestId, eventCode, onLikeToggled, onDeleted }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [commentsCount, setCommentsCount] = useState(photo.comments_count || 0);
  const isMine = photo.guest_id === currentGuestId;
  const authorName = photo.guests?.full_name || t("photoCard.guestFallback");

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    try {
      if (photo.liked_by_me) {
        await supabase.from("likes").delete().eq("photo_id", photo.id).eq("guest_id", currentGuestId);
        onLikeToggled(photo.id, false);
      } else {
        await supabase.from("likes").insert({ photo_id: photo.id, guest_id: currentGuestId });
        onLikeToggled(photo.id, true);
        setPopped(true);
        setTimeout(() => setPopped(false), 400);
      }
    } catch (e) {
      // тихо игнорируем гонки — счётчик подтянется реалтаймом
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="break-inside-avoid mb-3 bg-paper border border-gold/45 animate-fade-up">
      <button
        type="button"
        onClick={() => setShowLightbox(true)}
        className="block w-full bg-champagne/40 overflow-hidden"
      >
        <img
          src={publicPhotoUrl(photo.thumbnail_path) || publicPhotoUrl(photo.image_path)}
          alt={authorName}
          loading="lazy"
          className="w-full h-auto block"
        />
      </button>

      <div className="px-2.5 py-2.5">
        <Link
          to={`/event/${eventCode}/guest/${photo.guest_id}`}
          className="block min-w-0 font-serif italic text-[15px] text-ink truncate hover:text-gold transition-colors"
        >
          {authorName}
          {isMine && <span className="text-gold/80 not-italic text-xs"> · {t("photoCard.you")}</span>}
        </Link>

        {photo.caption && (
          <p className="mt-1 font-serif italic text-[13px] leading-snug text-dim break-words">
            {photo.caption}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3.5">
          <button
            onClick={toggleLike}
            disabled={busy}
            className={photo.liked_by_me ? "flex text-blush" : "flex text-ink-soft"}
            aria-label={t("photoCard.likeAria")}
          >
            <HeartIcon active={photo.liked_by_me} className={popped ? "animate-heart-pop" : ""} />
          </button>
          <button
            onClick={() => setShowLikers(true)}
            className="font-sans text-[11px] font-semibold text-ink-soft hover:text-gold transition-colors -ml-2"
          >
            {photo.likes_count}
          </button>

          <button
            onClick={() => setShowLightbox(true)}
            className="flex items-center gap-1.5 text-dim hover:text-gold transition-colors"
            aria-label={t("photoCard.commentAria")}
          >
            <CommentIcon />
            <span className="font-sans text-[11px] font-semibold">{commentsCount}</span>
          </button>
        </div>
      </div>

      {showLikers && (
        <LikersModal photoId={photo.id} eventCode={eventCode} onClose={() => setShowLikers(false)} />
      )}
      {showLightbox && (
        <PhotoLightbox
          photo={photo}
          currentGuestId={currentGuestId}
          eventCode={eventCode}
          onClose={() => setShowLightbox(false)}
          onLikeToggled={onLikeToggled}
          onDeleted={(id) => {
            onDeleted?.(id);
            setShowLightbox(false);
          }}
          onCommentCountChange={(delta) => setCommentsCount((prev) => Math.max(0, prev + delta))}
        />
      )}
    </div>
  );
}
