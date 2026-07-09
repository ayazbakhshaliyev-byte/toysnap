import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicPhotoUrl, supabase, PHOTOS_BUCKET } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getInitials } from "../lib/initials";
import { containsBlockedWords } from "../lib/textFilter";
import HeartIcon from "./HeartIcon";

const COMMENT_LIMIT = 300;

export default function PhotoLightbox({
  photo,
  currentGuestId,
  eventCode,
  onClose,
  onLikeToggled,
  onDeleted,
  onCommentCountChange,
}) {
  const { t } = useLanguage();
  const [comments, setComments] = useState([]);
  const [commentLikedIds, setCommentLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const isMine = photo.guest_id === currentGuestId;
  const authorName = photo.guests?.full_name || t("photoCard.guestFallback");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: commentRows } = await supabase
        .from("comments")
        .select("*, guests(full_name), comment_likes(count)")
        .eq("photo_id", photo.id)
        .order("created_at", { ascending: true });

      const { data: myCommentLikes } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("guest_id", currentGuestId);

      if (cancelled) return;
      setComments(
        (commentRows || []).map((c) => ({ ...c, likes_count: c.comment_likes?.[0]?.count ?? 0 }))
      );
      setCommentLikedIds(new Set((myCommentLikes || []).map((l) => l.comment_id)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [photo.id, currentGuestId]);

  async function toggleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      if (photo.liked_by_me) {
        await supabase.from("likes").delete().eq("photo_id", photo.id).eq("guest_id", currentGuestId);
        onLikeToggled(photo.id, false);
      } else {
        await supabase.from("likes").insert({ photo_id: photo.id, guest_id: currentGuestId });
        onLikeToggled(photo.id, true);
      }
    } catch (e) {
      // тихо игнорируем гонки
    } finally {
      setLikeBusy(false);
    }
  }

  async function toggleCommentLike(comment) {
    const liked = commentLikedIds.has(comment.id);
    setCommentLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.delete(comment.id) : next.add(comment.id);
      return next;
    });
    setComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, likes_count: c.likes_count + (liked ? -1 : 1) } : c))
    );
    try {
      if (liked) {
        await supabase.from("comment_likes").delete().eq("comment_id", comment.id).eq("guest_id", currentGuestId);
      } else {
        await supabase.from("comment_likes").insert({ comment_id: comment.id, guest_id: currentGuestId });
      }
    } catch (e) {
      // тихо игнорируем гонки — счётчик подтянется при следующем открытии
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    if (body.length > COMMENT_LIMIT) {
      setError(t("comments.tooLong"));
      return;
    }
    if (containsBlockedWords(body)) {
      setError(t("comments.profanity"));
      return;
    }
    setSending(true);
    setError(null);
    try {
      const { data, error: insertErr } = await supabase
        .from("comments")
        .insert({ photo_id: photo.id, guest_id: currentGuestId, body })
        .select("*, guests(full_name)")
        .single();
      if (insertErr) throw insertErr;
      setComments((prev) => [...prev, { ...data, likes_count: 0 }]);
      setText("");
      onCommentCountChange?.(1);
    } catch (e2) {
      setError(t("comments.sendError"));
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteComment(comment) {
    if (!confirm(t("comments.deleteConfirm"))) return;
    await supabase.from("comments").delete().eq("id", comment.id);
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    onCommentCountChange?.(-1);
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
    <div className="fixed inset-0 z-50 bg-ink/85 flex flex-col sm:items-center sm:justify-center sm:p-6 animate-fade-up">
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[460px] sm:rounded-md sm:overflow-hidden sm:shadow-soft-hover bg-noir flex flex-col">
      <div className="flex-none flex items-center justify-between px-4 py-3.5">
        <button
          onClick={onClose}
          aria-label={t("photoCard.close")}
          className="w-[34px] h-[34px] rounded-full border border-champagne/40 flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e5d8b8" strokeWidth="1.6" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          {isMine && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-blush/55 rounded-[2px]
                         font-sans text-[9px] font-semibold tracking-[0.2em] uppercase text-blush disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
              {deleting ? t("photoCard.deleting") : t("photoCard.delete")}
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-3.5 py-2 border border-champagne/50 rounded-[2px]
                       font-sans text-[9px] font-semibold tracking-[0.2em] uppercase text-champagne disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" />
            </svg>
            {t("photoCard.download")}
          </button>
        </div>
      </div>

      <div className="flex-none bg-noir-deep flex items-center justify-center overflow-hidden">
        <img
          src={publicPhotoUrl(photo.image_path)}
          alt={authorName}
          className="max-w-full max-h-[42vh] sm:max-h-[380px] object-contain"
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-sheet min-h-0">
        <div className="px-5 pt-4.5 pb-3 border-b border-gold/25">
          <Link to={`/event/${eventCode}/guest/${photo.guest_id}`} onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex-none w-[38px] h-[38px] rounded-full border border-gold flex items-center justify-center bg-white">
              <span className="font-serif text-[15px] text-ink">{getInitials(authorName)}</span>
            </span>
            <span>
              <span className="block font-serif italic text-[19px] text-ink">{authorName}</span>
              {photo.caption && (
                <span className="block font-serif italic text-[13px] text-dim">{photo.caption}</span>
              )}
            </span>
          </Link>
          <div className="flex items-center gap-2 mt-3.5">
            <button
              onClick={toggleLike}
              disabled={likeBusy}
              className={photo.liked_by_me ? "flex text-blush" : "flex text-ink-soft"}
              aria-label={t("photoCard.likeAria")}
            >
              <HeartIcon active={photo.liked_by_me} />
            </button>
            <span className="font-sans text-[12px] font-semibold text-ink-soft">{photo.likes_count}</span>
          </div>
        </div>

        <div className="px-5 pt-4 pb-1 font-sans text-[8.5px] font-semibold tracking-[0.22em] uppercase text-gold">
          {t("comments.title")} · {comments.length}
        </div>

        <div className="px-5">
          {loading ? (
            <p className="py-5 font-serif italic text-dim">{t("comments.loading")}</p>
          ) : comments.length === 0 ? (
            <p className="py-5 font-serif italic text-[15px] text-dim">{t("comments.empty")}</p>
          ) : (
            comments.map((c) => {
              const liked = commentLikedIds.has(c.id);
              return (
                <div key={c.id} className="flex gap-2.5 py-2.5 border-b border-gold/15">
                  <span className="flex-none w-8 h-8 rounded-full border border-gold/55 flex items-center justify-center bg-white">
                    <span className="font-serif text-xs text-ink">{getInitials(c.guests?.full_name)}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        to={`/event/${eventCode}/guest/${c.guest_id}`}
                        onClick={onClose}
                        className="font-sans text-[11px] font-semibold text-ink-soft"
                      >
                        {c.guests?.full_name || t("photoCard.guestFallback")}
                      </Link>
                      <div className="flex items-center gap-2.5 flex-none">
                        {c.guest_id === currentGuestId && (
                          <button
                            onClick={() => handleDeleteComment(c)}
                            className="font-sans text-[9px] text-blush/70 hover:text-blush"
                          >
                            {t("comments.delete")}
                          </button>
                        )}
                        <button
                          onClick={() => toggleCommentLike(c)}
                          className={`flex items-center gap-1 ${liked ? "text-blush" : "text-dim"}`}
                          aria-label={t("comments.likeAria")}
                        >
                          <HeartIcon active={liked} size={15} />
                          <span className="font-sans text-[10px]">{c.likes_count}</span>
                        </button>
                      </div>
                    </div>
                    <div className="font-serif text-sm leading-snug text-ink-soft mt-0.5 break-words">
                      {c.body}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div className="h-3.5" />
        </div>
      </div>

      <form onSubmit={handleSend} className="flex-none bg-sheet border-t border-gold/30 px-4 pt-2.5 pb-5">
        <div className="flex items-end gap-2.5">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, COMMENT_LIMIT));
              if (error) setError(null);
            }}
            placeholder={t("comments.placeholder")}
            rows={1}
            className="flex-1 resize-none bg-white border border-gold/45 rounded-[2px] px-3 py-2.5
                       font-serif text-[15px] text-ink placeholder:text-dim/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="flex-none px-3.5 py-2.5 bg-forest text-paper font-sans text-[9px] font-semibold tracking-[0.16em] uppercase disabled:opacity-40"
          >
            {t("comments.send")}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs font-sans text-blush">{error}</p>}
        <div className="text-right mt-1 font-sans text-[8.5px] tracking-wide text-dim/70">
          {text.length}/{COMMENT_LIMIT}
        </div>
      </form>
    </div>
    </div>
  );
}
