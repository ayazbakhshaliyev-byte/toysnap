import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useGuestSession(eventCode) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [guest, setGuest] = useState(null);
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: eventRow, error: eventErr } = await supabase
        .from("events")
        .select("*")
        .eq("code", eventCode)
        .maybeSingle();

      if (eventErr) throw eventErr;
      if (!eventRow) {
        setError("Событие не найдено. Проверьте ссылку из QR-кода.");
        setLoading(false);
        return;
      }
      if (!eventRow.is_active) {
        setError("Голосование для этого события завершено.");
        setLoading(false);
        return;
      }
      setEvent(eventRow);

      let {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { data, error: signInErr } = await supabase.auth.signInAnonymously();
        if (signInErr) throw signInErr;
        session = data.session;
      }

      const userId = session.user.id;

      const { data: guestRow, error: guestErr } = await supabase
        .from("guests")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (guestErr) throw guestErr;

      if (guestRow && guestRow.event_id !== eventRow.id) {
        setError(
          "Этот браузер уже зарегистрирован на другом мероприятии. Откройте ссылку в другом браузере или в режиме инкогнито."
        );
        setLoading(false);
        return;
      }

      setGuest(guestRow || null);
    } catch (e) {
      setError(e.message || "Не удалось загрузить событие.");
    } finally {
      setLoading(false);
    }
  }, [eventCode]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const registerGuest = useCallback(
    async (fullName) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session.user.id;

      const { data, error: insertErr } = await supabase
        .from("guests")
        .insert({ id: userId, event_id: event.id, full_name: fullName.trim() })
        .select()
        .single();

      if (insertErr) throw insertErr;
      setGuest(data);
      return data;
    },
    [event]
  );

  return { loading, event, guest, error, registerGuest, reload: bootstrap };
}
