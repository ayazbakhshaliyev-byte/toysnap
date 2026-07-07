import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// error — это ключ перевода (например "eventGate.notFound"), а не готовый текст.
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
        setError("eventGate.notFound");
        setLoading(false);
        return;
      }
      if (!eventRow.is_active) {
        setError("eventGate.inactive");
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
        setError("eventGate.wrongEvent");
        setLoading(false);
        return;
      }

      setGuest(guestRow || null);
    } catch (e) {
      setError("eventGate.generic");
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
