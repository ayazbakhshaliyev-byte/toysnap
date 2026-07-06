import { useState } from "react";
import { Link } from "react-router-dom";
import { publicPhotoUrl, supabase, PHOTOS_BUCKET } from "../lib/supabaseClient";
import HeartIcon from "./HeartIcon";
import DownloadIcon from "./DownloadIcon";
import CommentIcon from "./CommentIcon";
import LikersModal from "./LikersModal";
import CommentsModal from "./CommentsModal";

export default function PhotoCard({ photo, currentGuestId, eventCode, onLikeToggled, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(photo.comments_count || 0);
  const isMine = photo.guest_id === currentGuestId;

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
      link.download = `photo-vote-${photo.id.slice(0, 8)}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert("Не получилось скачать фото. Попробуйте ещё раз.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    if (!confirm("Удалить это фото? Отменить будет нельзя.")) return;
    setDeleting(true);
    try {
      await supabase.storage
        .from(PHOTOS_BUCKET)
        .remove([photo.image_path, photo.thumbnail_path, photo.original_path].filter(Boolean));
      await supabase.from("photos").delete().eq("id", photo.id);
      onDeleted?.(photo.id);
    } catch (e) {
      alert("Не получилось удалить фото. Попробуйте ещё раз.");
      setDeleting(false);
    }
  }

  return (
    <div className="photo-card break-inside-avoid mb-4 bg-white rounded-lg border border-champagne shadow-soft hover:shadow-soft-hover transition-all duration-300 overflow-hidden animate-fade-up">
      <div className="bg-warm-beige overflow-hidden">
        <img
          src={publicPhotoUrl(photo.thumbnail_path) || publicPhotoUrl(photo.image_path)}
          alt={`Момент от ${photo.guests?.full_name || "гостя"}`}
          loading="lazy"
          className="w-full h-auto block"
        />
      </div>
      <div className="px-3 py-2.5">
        <Link
          to={`/event/${eventCode}/guest/${photo.guest_id}`}
          className="min-w-0 text-xs text-slate/70 font-sans truncate hover:text-dusty-rose hover:underline"
        >
          {photo.guests?.full_name || "Гость"}
          {isMine && <span className="text-sage"> · вы</span>}
        </Link>

        {photo.caption && (
          <p className="mt-1.5 text-sm text-slate/80 font-sans leading-snug break-words">
            {photo.caption}
          </p>
        )}

        <div className="mt-2.5 flex items-center gap-4">
          <button
            onClick={toggleLike}
            disabled={busy}
            className={`flex items-center gap-1.5 ${
              photo.liked_by_me ? "text-dusty-rose" : "text-slate/40"
            }`}
            aria-label="Поставить лайк"
          >
            <HeartIcon active={photo.liked_by_me} className={popped ? "animate-heart-pop" : ""} />
          </button>
          <button
            onClick={() => setShowLikers(true)}
            className="text-sm font-serif text-slate/70 hover:text-dusty-rose -ml-2"
          >
            {photo.likes_count}
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-slate/40 hover:text-slate/70"
            aria-label="Комментарии"
          >
            <CommentIcon />
            <span className="text-sm font-serif">{commentsCount}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 text-slate/40 hover:text-slate/70 disabled:opacity-40"
            aria-label="Скачать оригинал"
          >
            <DownloadIcon />
          </button>

          {isMine && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto text-xs text-dusty-rose/70 hover:text-dusty-rose underline disabled:opacity-40"
            >
              {deleting ? "Удаляем…" : "Удалить"}
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
