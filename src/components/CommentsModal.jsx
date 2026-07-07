import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { containsBlockedWords } from "../lib/textFilter";
import { useLanguage } from "../lib/i18n/LanguageContext";

const QUICK_EMOJI = ["❤️", "😍", "🥂", "😂", "🔥", "✨", "👏", "😭"];
const COMMENT_LIMIT = 300;

export default function CommentsModal({ photoId, currentGuestId, onClose, onCountChange }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("comments")
      .select("*, guests(full_name)")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    setComments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [photoId]);

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
        .insert({ photo_id: photoId, guest_id: currentGuestId, body })
        .select("*, guests(full_name)")
        .single();
      if (insertErr) throw insertErr;
      setComments((prev) => [...prev, data]);
      setText("");
      onCountChange?.(1);
    } catch (e2) {
      setError(t("comments.sendError"));
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(comment) {
    if (!confirm(t("comments.deleteConfirm"))) return;
    await supabase.from("comments").delete().eq("id", comment.id);
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    onCountChange?.(-1);
  }

  return (
    <div
      className="fixed inset-0 bg-slate/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-ivory rounded-t-2xl sm:rounded-2xl p-6 animate-fade-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="font-serif italic text-xl text-slate">{t("comments.title")}</h2>
          <button onClick={onClose} className="text-slate/40 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[100px]">
          {loading ? (
            <p className="text-slate/40 font-sans text-sm">{t("comments.loading")}</p>
          ) : comments.length === 0 ? (
            <p className="text-slate/50 font-sans text-sm">{t("comments.empty")}</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-2">
                <p className="text-sm font-sans text-slate/80 break-words">
                  <span className="font-medium text-slate">
                    {c.guests?.full_name || t("photoCard.guestFallback")}
                  </span>{" "}
                  {c.body}
                </p>
                {c.guest_id === currentGuestId && (
                  <button
                    onClick={() => handleDelete(c)}
                    className="text-xs text-dusty-rose/60 hover:text-dusty-rose shrink-0"
                  >
                    {t("comments.delete")}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="shrink-0 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((prev) => (prev + emoji).slice(0, COMMENT_LIMIT))}
                className="text-lg px-1.5 py-0.5 rounded hover:bg-champagne/60"
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value.slice(0, COMMENT_LIMIT));
                if (error) setError(null);
              }}
              placeholder={t("comments.placeholder")}
              className="flex-1 h-12 px-3 rounded-lg bg-warm-beige border border-champagne
                         font-sans text-sm text-slate placeholder:text-slate/40
                         focus:outline-none focus:ring-2 focus:ring-dusty-rose/50 transition"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-5 rounded-lg bg-dusty-rose text-white font-sans text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
          {error && <p className="text-xs text-dusty-rose">{error}</p>}
        </form>
      </div>
    </div>
  );
}
