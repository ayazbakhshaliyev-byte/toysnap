import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAdminSession(eventCode) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data: eventRow } = await supabase
      .from("events")
      .select("*")
      .eq("code", eventCode)
      .maybeSingle();
    setEvent(eventRow || null);

    if (!session || session.user.is_anonymous || !eventRow) {
      setUser(session?.user?.is_anonymous ? null : session?.user || null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setUser(session.user);

    const { data: adminRow } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("event_id", eventRow.id)
      .maybeSingle();

    setIsAdmin(!!adminRow);
    setLoading(false);
  }, [eventCode]);

  useEffect(() => {
    check();
  }, [check]);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await check();
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    await check();
  }

  async function signOut() {
    await supabase.auth.signOut();
    await check();
  }

  return { loading, user, event, isAdmin, signIn, signUp, signOut, reload: check };
}
