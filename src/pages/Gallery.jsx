import { useCallback, useEffect, useState } from "react";
import { supabase, publicPhotoUrl } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getPartnerName, getMonogramInitials, hasCoupleNames } from "../lib/coupleInfo";
import PhotoCard from "../components/PhotoCard";
import UploadModal from "../components/UploadModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import CoupleMonogram from "../components/CoupleMonogram";
import { Link } from "react-router-dom";

const PAGE_SIZE = 24;

export default function Gallery({ event, guest }) {
  const { t, lang } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [sort, setSort] = useState("popular"); // popular | fresh
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [momentsCount, setMomentsCount] = useState(0);
  const coverUrl = event?.cover_photo_path ? publicPhotoUrl(event.cover_photo_path) : null;

  const showCoupleNames = hasCoupleNames(event);
  const partner1 = getPartnerName(event, 1, lang);
  const partner2 = getPartnerName(event, 2, lang);
  const { initial1, initial2 } = getMonogramInitials(event);

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

    const { count } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("is_hidden", false);

    const { data: myLikes } = await supabase
      .from("likes")
      .select("photo_id")
      .eq("guest_id", guest.id);

    setLikedIds(new Set((myLikes || []).map((l) => l.photo_id)));
    setPhotos(photoRows || []);
    setMomentsCount(count || 0);
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
            setMomentsCount((c) => c + 1);
          } else if (payload.eventType === "UPDATE") {
            setPhotos((prev) =>
              prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            );
          } else if (payload.eventType === "DELETE") {
            setPhotos((prev) => prev.filter((p) => p.id !== payload.old.id));
            setMomentsCount((c) => Math.max(0, c - 1));
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
    <div className="paper-texture min-h-screen pb-28">
      <header className="sticky top-0 z-20 paper-texture border-b border-gold/45 pt-11 pb-3.5 px-5">
        <Link
          to={`/event/${event.code}/winner`}
          className="absolute top-4 left-5 font-sans text-[9px] font-semibold tracking-[0.2em] uppercase text-dim/70 hover:text-gold transition-colors"
        >
          {t("gallery.winnerLink")}
        </Link>
        <div className="absolute top-4 right-5">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center justify-center gap-2.5">
          {showCoupleNames && (
            <CoupleMonogram initial1={initial1} initial2={initial2} variant="compact" />
          )}
          {showCoupleNames ? (
            <div className="font-serif italic text-[23px] text-ink">
              {partner1} <span className="font-script not-italic text-gold text-[22px]">&amp;</span> {partner2}
            </div>
          ) : (
            <div className="font-serif italic text-[23px] text-ink">{event.title}</div>
          )}
        </div>

        <div className="text-center mt-2">
          <span className="font-sans text-[9px] font-semibold tracking-[0.24em] uppercase text-gold">
            {momentsCount} {t("gallery.momentsWord")}
          </span>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          {[
            { key: "popular", label: t("gallery.sortPopular") },
            { key: "fresh", label: t("gallery.sortFresh") },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`pb-[3px] font-sans text-[10px] font-semibold tracking-[0.16em] uppercase border-b transition-colors ${
                sort === opt.key ? "text-gold border-gold" : "text-dim border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-3.5 pt-4">
        {loading ? (
          <p className="text-center text-dim font-sans py-16">{t("gallery.loading")}</p>
        ) : decorated.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dim font-sans">{t("gallery.empty")}</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
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

      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 pointer-events-none">
        <button
          onClick={() => setShowUpload(true)}
          className="pointer-events-auto flex items-center gap-3 px-7 py-[15px] bg-rose border border-gold/50 rounded-[2px]
                     text-rose-ink font-sans text-[9.5px] font-semibold tracking-[0.22em] uppercase shadow-soft-hover"
        >
          <span className="text-gold text-[7px]">◆</span>
          {t("gallery.share")}
          <span className="text-gold text-[7px]">◆</span>
        </button>
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
