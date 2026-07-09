import { useState } from "react";
import { Link } from "react-router-dom";
import { publicPhotoUrl, supabase, PHOTOS_BUCKET } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import HeartIcon from "./HeartIcon";
import DownloadIcon from "./DownloadIcon";
import CommentIcon from "./CommentIcon";
import LikersModal from "./LikersModal";
import CommentsModal from "./CommentsModal";

export default function PhotoCard({ photo, currentGuestId, eventCode, onLikeToggled, onDeleted }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [showComments, setShowComments] = useState(false);
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

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const url = publicPhotoUrl(photo.original_path || photo.image_path);
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const ext = (photo.original_path || photo.image_path || "").split(".").pop() || "jpg";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `toysnap-${photo.id.slice(0, 8)}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert(t("photoCard.downloadError"));
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    if (!confirm(t("photoCard.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([photo.image_path, photo.thumbnail_path, photo.original_path].filter(Boolean));
      await supabase.from("photos").delete().eq("id", photo.id);
      onDeleted?.(photo.id);
    } catch (e) {
      alert(t("photoCard.deleteError"));
      setDeleting(false);
    }
  }

  return (
    <div className="break-inside-avoid mb-3 bg-paper border border-gold/45 animate-fade-up">
      <div className="bg-champagne/40 overflow-hidden">
        <img
          src={publicPhotoUrl(photo.thumbnail_path) || publicPhotoUrl(photo.image_path)}
          alt={authorName}
          loading="lazy"
          className="w-full h-auto block"
        />
      </div>
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
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-dim hover:text-gold transition-colors"
            aria-label={t("photoCard.commentAria")}
          >
            <CommentIcon />
            <span className="font-sans text-[11px] font-semibold">{commentsCount}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex text-dim hover:text-gold transition-colors disabled:opacity-40"
            aria-label={t("photoCard.downloadAria")}
          >
            <DownloadIcon />
          </button>

          {isMine && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto font-sans text-[9px] font-semibold tracking-[0.14em] uppercase text-blush/80 hover:text-blush disabled:opacity-40"
            >
              {deleting ? t("photoCard.deleting") : t("photoCard.delete")}
            </button>
          )}
        </div>
      </div>

      {showLikers && <LikersModal photoId={photo.id} onClose={() => setShowLikers(false)} />}
      {showComments && (
        <CommentsModal
          photoId={photo.id}
          currentGuestId={currentGuestId}
          onClose={() => setShowComments(false)}
          onCountChange={(delta) => setCommentsCount((prev) => Math.max(0, prev + delta))}
        />
      )}
    </div>
  );
}
