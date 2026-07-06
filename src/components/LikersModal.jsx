import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LikersModal({ photoId, onClose }) {
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("likes")
        .select("guest_id, created_at, guests(full_name)")
        .eq("photo_id", photoId)
        .order("created_at", { ascending: false });
      setLikers(data || []);
      setLoading(false);
    })();
  }, [photoId]);

  return (
    <div
      className="fixed inset-0 bg-slate/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-ivory rounded-t-2xl sm:rounded-2xl p-6 animate-fade-up max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif italic text-xl text-slate">Кому понравилось</h2>
          <button onClick={onClose} className="text-slate/40 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-slate/40 font-sans text-sm">Загрузка…</p>
        ) : likers.length === 0 ? (
          <p className="text-slate/50 font-sans text-sm">Пока никто не лайкнул.</p>
        ) : (
          <ul className="space-y-2">
            {likers.map((l) => (
              <li key={l.guest_id} className="text-sm text-slate font-sans">
                {l.guests?.full_name || "Гость"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
