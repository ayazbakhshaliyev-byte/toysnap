import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGuestSession } from "../hooks/useGuestSession";
import { supabase, publicPhotoUrl } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getInitials } from "../lib/initials";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PhotoLightbox from "../components/PhotoLightbox";
import Entry from "./Entry";

function GuestProfileContent({ event, viewer, guestId }) {
  const { t } = useLanguage();
  const [targetGuest, setTargetGuest] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [openPhotoId, setOpenPhotoId] = useState(null);

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
  const openPhoto = decorated.find((p) => p.id === openPhotoId) || null;
  const guestName = targetGuest?.full_name || t("profile.guestFallback");

  return (
    <div className="paper-texture min-h-screen pb-16">
      <div className="absolute top-4 right-5 z-10">
        <LanguageSwitcher />
      </div>

      <header className="pt-14 px-7 flex flex-col items-center text-center">
        <Link
          to={`/event/${event.code}`}
          className="self-start flex items-center gap-1.5 font-sans text-[9.5px] font-semibold tracking-[0.18em] uppercase text-dim"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t("profile.back")}
        </Link>

        <span className="mt-6 w-[82px] h-[82px] rounded-full border border-gold flex items-center justify-center bg-paper">
          <span className="font-serif text-[30px] text-ink tracking-wide">{getInitials(guestName)}</span>
        </span>

        <h1 className="font-serif italic font-medium text-[27px] leading-tight text-ink mt-4">
          {guestName}
        </h1>

        <div className="flex items-center gap-3 mt-4">
          <span className="w-6 h-px bg-gold/55" />
          <span className="font-sans text-[8.5px] font-semibold tracking-[0.2em] uppercase text-gold">
            {photos.length} {t("profile.photoCount")}
          </span>
          <span className="w-6 h-px bg-gold/55" />
        </div>
      </header>

      <main className="px-3.5 pt-7">
        {loading ? (
          <p className="text-center text-dim font-sans py-16">{t("profile.loading")}</p>
        ) : decorated.length === 0 ? (
          <p className="text-center text-dim font-sans py-16">{t("profile.empty")}</p>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {decorated.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setOpenPhotoId(photo.id)}
                className="block w-full break-inside-avoid mb-3 bg-paper border border-gold/45 overflow-hidden"
              >
                <img
                  src={publicPhotoUrl(photo.thumbnail_path) || publicPhotoUrl(photo.image_path)}
                  alt={guestName}
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </button>
            ))}
          </div>
        )}
      </main>

      {openPhoto && (
        <PhotoLightbox
          photo={openPhoto}
          currentGuestId={viewer.id}
          eventCode={event.code}
          onClose={() => setOpenPhotoId(null)}
          onLikeToggled={handleLikeToggled}
          onDeleted={(id) => {
            setPhotos((prev) => prev.filter((p) => p.id !== id));
            setOpenPhotoId(null);
          }}
          onCommentCountChange={() => {}}
        />
      )}
    </div>
  );
}

export default function GuestProfile() {
  const { code, guestId } = useParams();
  const { t } = useLanguage();
  const { loading, event, guest, error, registerGuest } = useGuestSession(code);

  if (loading) {
    return (
      <div className="paper-texture min-h-screen flex items-center justify-center">
        <p className="font-serif italic text-dim text-lg">{t("eventGate.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-texture min-h-screen flex items-center justify-center px-6">
        <p className="text-center text-ink-soft font-sans max-w-sm">{t(error)}</p>
      </div>
    );
  }

  if (!guest) {
    return <Entry event={event} onSubmit={registerGuest} />;
  }

  return <GuestProfileContent event={event} viewer={guest} guestId={guestId} />;
}
