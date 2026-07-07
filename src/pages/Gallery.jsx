import { useCallback, useEffect, useState } from "react";
import { supabase, publicPhotoUrl } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import PhotoCard from "../components/PhotoCard";
import UploadModal from "../components/UploadModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Link } from "react-router-dom";

const PAGE_SIZE = 24;

export default function Gallery({ event, guest }) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [sort, setSort] = useState("popular"); // popular | fresh
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const coverUrl = event?.cover_photo_path ? publicPhotoUrl(event.cover_photo_path) : null;

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    const orderCol = sort === "popular" ? "likes_count" : "created_at";
    const { data: photoRows } = await supabase
      .from("photos")
      .select("*, guests(full_name)")
      .eq("event_id", event.id)
      .eq("is_hidden", false)
      .order(orderCol, { ascending: false })
      .limit(PAGE_SIZE);

    const { data: myLikes } = await supabase
      .from("likes")
      .select("photo_id")
      .eq("guest_id", guest.id);

    setLikedIds(new Set((myLikes || []).map((l) => l.photo_id)));
    setPhotos(photoRows || []);
    setLoading(false);
  }, [event.id, guest.id, sort]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    const channel = supabase
      .channel(`event-${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "photos", filter: `event_id=eq.${event.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPhotos((prev) =>
              prev.some((p) => p.id === payload.new.id) ? prev : [payload.new, ...prev]
            );
          } else if (payload.eventType === "UPDATE") {
            setPhotos((prev) =>
              prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            );
          } else if (payload.eventType === "DELETE") {
            setPhotos((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

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

  const decorated = photos
    .map((p) => ({ ...p, liked_by_me: likedIds.has(p.id) }))
    .sort((a, b) =>
      sort === "popular" ? b.likes_count - a.likes_count : new Date(b.created_at) - new Date(a.created_at)
    );

  return (
    <div className="min-h-screen bg-ivory pb-28">
      <header className="pt-10 pb-6 px-6 text-center relative">
        <div className="absolute top-4 left-4">
          <LanguageSwitcher />
        </div>

        {coverUrl && (
          <div className="mx-auto mb-4 w-24 h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden bg-warm-beige shadow-soft">
            <img src={coverUrl} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-sage tracking-[0.25em] text-xs uppercase mb-2">{t("gallery.brand")}</p>
        <h1 className="font-serif italic text-3xl text-slate">{event.title}</h1>
        <p className="mt-3 text-slate/50 font-sans text-sm">——— ✦ ———</p>
      </header>

      <div className="flex justify-center gap-2 mb-6 px-6">
        {[
          { key: "popular", label: t("gallery.sortPopular") },
          { key: "fresh", label: t("gallery.sortFresh") },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={`px-4 py-2 rounded-full text-sm font-sans transition-colors ${
              sort === opt.key
                ? "bg-dusty-rose text-white"
                : "bg-champagne text-slate/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <main className="max-w-[1200px] mx-auto px-4">
        {loading ? (
          <p className="text-center text-slate/40 font-sans py-16">{t("gallery.loading")}</p>
        ) : decorated.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate/50 font-sans">{t("gallery.empty")}</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {decorated.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                currentGuestId={guest.id}
                eventCode={event.code}
                onLikeToggled={handleLikeToggled}
                onDeleted={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ivory via-ivory/95 to-transparent">
        <div className="max-w-[1200px] mx-auto flex justify-center">
          <button
            onClick={() => setShowUpload(true)}
            className="h-14 px-8 rounded-full bg-slate text-ivory font-sans tracking-wide shadow-soft-hover"
          >
            {t("gallery.share")}
          </button>
        </div>
      </div>

      <div className="fixed top-4 right-4">
        <Link to={`/event/${event.code}/winner`} className="text-xs text-slate/40 font-sans underline">
          {t("gallery.winnerLink")}
        </Link>
      </div>

      {showUpload && (
        <UploadModal
          event={event}
          guest={guest}
          onClose={() => setShowUpload(false)}
          onUploaded={(row) => setPhotos((prev) => [{ ...row, likes_count: 0 }, ...prev])}
        />
      )}
    </div>
  );
}
