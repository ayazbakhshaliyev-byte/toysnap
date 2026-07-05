import { useState } from "react";
import { publicPhotoUrl, supabase } from "../lib/supabaseClient";
import HeartIcon from "./HeartIcon";

export default function PhotoCard({ photo, currentGuestId, onLikeToggled }) {
  const [busy, setBusy] = useState(false);
  const [popped, setPopped] = useState(false);
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
      // тихо игнорируем гонки (например, двойной клик) — счётчик подтянется реалтаймом
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="photo-card bg-white rounded-lg border border-champagne shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-fade-up">
      <div className="aspect-square bg-warm-beige overflow-hidden">
        <img
          src={publicPhotoUrl(photo.thumbnail_path) || publicPhotoUrl(photo.image_path)}
          alt={`Момент от ${photo.guests?.full_name || "гостя"}`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-xs text-slate/70 font-sans truncate">
            {photo.guests?.full_name || "Гость"}
            {isMine && <span className="text-sage"> · вы</span>}
          </p>
        </div>
        <button
          onClick={toggleLike}
          disabled={busy}
          className={`flex items-center gap-1.5 shrink-0 ${
            photo.liked_by_me ? "text-dusty-rose" : "text-slate/40"
          }`}
          aria-label="Поставить лайк"
        >
          <HeartIcon active={photo.liked_by_me} className={popped ? "animate-heart-pop" : ""} />
          <span className="font-serif text-sm">{photo.likes_count}</span>
        </button>
      </div>
    </div>
  );
}
