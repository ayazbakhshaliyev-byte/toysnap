import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGuestSession } from "../hooks/useGuestSession";
import { supabase } from "../lib/supabaseClient";
import PhotoCard from "../components/PhotoCard";
import Entry from "./Entry";

function GuestProfileContent({ event, viewer, guestId }) {
  const [targetGuest, setTargetGuest] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: guestRow } = await supabase
      .from("guests")
      .select("*")
      .eq("id", guestId)
      .maybeSingle();
    setTargetGuest(guestRow);

    const { data: photoRows } = await supabase
      .from("photos")
      .select("*, guests(full_name)")
      .eq("event_id", event.id)
      .eq("guest_id", guestId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });
    setPhotos(photoRows || []);

    const { data: myLikes } = await supabase
      .from("likes")
      .select("photo_id")
      .eq("guest_id", viewer.id);
    setLikedIds(new Set((myLikes || []).map((l) => l.photo_id)));

    setLoading(false);
  }, [event.id, guestId, viewer.id]);

  useEffect(() => {
    load();
  }, [load]);

  function handleLikeToggled(photoId, liked) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.add(photoId) : next.delete(photoId);
      return next;
    });
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, likes_count: p.likes_count + (liked ? 1 : -1) } : p
      )
    );
  }

  const decorated = photos.map((p) => ({ ...p, liked_by_me: likedIds.has(p.id) }));

  return (
    <div className="min-h-screen bg-ivory pb-16">
      <header className="pt-10 pb-6 px-6 text-center">
        <Link to={`/event/${event.code}`} className="text-xs text-slate/40 font-sans underline">
          ← Назад в галерею
        </Link>
        <h1 className="font-serif italic text-3xl text-slate mt-4">
          {targetGuest?.full_name || "Гость"}
        </h1>
        <p className="mt-1 text-slate/50 font-sans text-sm">
          {photos.length} {photos.length === 1 ? "фото" : "фото"}
        </p>
        <p className="mt-3 text-slate/40 font-sans text-sm">——— ✦ ———</p>
      </header>

      <main className="max-w-[1200px] mx-auto px-4">
        {loading ? (
          <p className="text-center text-slate/40 font-sans py-16">Загрузка…</p>
        ) : decorated.length === 0 ? (
          <p className="text-center text-slate/50 font-sans py-16">Этот гость ещё не поделился фото.</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {decorated.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                currentGuestId={viewer.id}
                eventCode={event.code}
                onLikeToggled={handleLikeToggled}
                onDeleted={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GuestProfile() {
  const { code, guestId } = useParams();
  const { loading, event, guest, error, registerGuest } = useGuestSession(code);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-serif italic text-slate/50 text-lg">Загружаем…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <p className="text-center text-slate/70 font-sans max-w-sm">{error}</p>
      </div>
    );
  }

  if (!guest) {
    return <Entry event={event} onSubmit={registerGuest} />;
  }

  return <GuestProfileContent event={event} viewer={guest} guestId={guestId} />;
}
