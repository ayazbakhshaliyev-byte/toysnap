import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, publicPhotoUrl } from "../../lib/supabaseClient";

export default function AdminDashboard({ event, onSignOut }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingWinner, setConfirmingWinner] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("photos")
      .select("*, guests(full_name)")
      .eq("event_id", event.id)
      .order("likes_count", { ascending: false });
    setPhotos(data || []);
    setLoading(false);
  }, [event.id]);

  useEffect(() => {
    load();
  }, [load]);

  const topScore = photos[0]?.likes_count ?? 0;
  const topTied = photos.filter((p) => p.likes_count === topScore && topScore > 0);

  async function toggleHidden(photo) {
    await supabase.from("photos").update({ is_hidden: !photo.is_hidden }).eq("id", photo.id);
    load();
  }

  async function deletePhoto(photo) {
    if (!confirm("Удалить это фото безвозвратно?")) return;
    await supabase.storage.from("wedding-photos").remove([photo.image_path, photo.thumbnail_path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    load();
  }

  async function confirmWinner(photoId) {
    const { error } = await supabase.rpc("admin_set_winner", {
      p_event_id: event.id,
      p_photo_id: photoId,
    });
    if (error) {
      setMessage("Не получилось: " + error.message);
    } else {
      setMessage("Победитель объявлен ✦");
      setConfirmingWinner(null);
    }
  }

  return (
    <div className="min-h-screen bg-ivory px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sage tracking-[0.2em] text-xs uppercase">Кабинет организатора</p>
            <h1 className="font-serif italic text-3xl text-slate">{event.title}</h1>
          </div>
          <div className="flex gap-4 items-center text-sm">
            <Link to={`/admin/${event.code}/qr`} className="text-slate/60 underline">
              QR-код
            </Link>
            <button onClick={onSignOut} className="text-slate/60 underline">
              Выйти
            </button>
          </div>
        </div>

        {message && <p className="mb-4 text-dusty-rose font-sans text-sm">{message}</p>}

        <section className="mb-10 p-5 bg-champagne/50 rounded-xl border border-champagne">
          <h2 className="font-serif text-xl text-slate mb-3">Определить победителя</h2>
          {topScore === 0 ? (
            <p className="text-slate/50 font-sans text-sm">Пока нет лайков — рано подводить итоги.</p>
          ) : topTied.length === 1 ? (
            <div className="flex items-center gap-4">
              <img
                src={publicPhotoUrl(topTied[0].thumbnail_path)}
                className="w-16 h-16 rounded object-cover"
                alt=""
              />
              <div className="flex-1">
                <p className="font-sans text-slate text-sm">{topTied[0].guests?.full_name}</p>
                <p className="text-slate/50 text-xs">{topTied[0].likes_count} лайков — явный лидер</p>
              </div>
              <button
                onClick={() => confirmWinner(topTied[0].id)}
                className="h-11 px-5 rounded-lg bg-old-gold text-white font-sans text-sm"
              >
                Объявить победителем
              </button>
            </div>
          ) : (
            <div>
              <p className="text-slate/60 font-sans text-sm mb-3">
                Ничья между {topTied.length} фото по {topScore} лайков — выберите победителя вручную:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {topTied.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => confirmWinner(p.id)}
                    className="text-left rounded-lg overflow-hidden border border-champagne bg-white"
                  >
                    <img src={publicPhotoUrl(p.thumbnail_path)} className="w-full aspect-square object-cover" alt="" />
                    <p className="text-xs font-sans p-2 text-slate/70">{p.guests?.full_name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {event.winner_photo_id && (
            <p className="mt-3 text-xs text-sage font-sans">
              Победитель уже объявлен. Экран: <Link className="underline" to={`/event/${event.code}/winner`}>открыть</Link>
            </p>
          )}
        </section>

        <section>
          <h2 className="font-serif text-xl text-slate mb-4">
            Все фото ({photos.length})
          </h2>
          {loading ? (
            <p className="text-slate/40 font-sans">Загрузка…</p>
          ) : (
            <div className="space-y-2">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border border-champagne"
                >
                  <img
                    src={publicPhotoUrl(p.thumbnail_path)}
                    className="w-12 h-12 rounded object-cover"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm text-slate truncate">{p.guests?.full_name}</p>
                    <p className="text-xs text-slate/40">{p.likes_count} лайков{p.is_hidden ? " · скрыто" : ""}</p>
                  </div>
                  <button
                    onClick={() => toggleHidden(p)}
                    className="text-xs px-3 py-2 rounded bg-warm-beige text-slate/70"
                  >
                    {p.is_hidden ? "Показать" : "Скрыть"}
                  </button>
                  <button
                    onClick={() => deletePhoto(p)}
                    className="text-xs px-3 py-2 rounded bg-dusty-rose/20 text-dusty-rose"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
