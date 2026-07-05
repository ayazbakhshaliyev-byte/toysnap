import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Winner from "./Winner";

export default function WinnerGate() {
  const { code } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("*").eq("code", code).maybeSingle();
      setEvent(data);
      setLoading(false);
    })();
  }, [code]);

  if (loading) return <div className="min-h-screen bg-slate" />;
  if (!event)
    return (
      <div className="min-h-screen bg-slate flex items-center justify-center">
        <p className="text-champagne font-sans">Событие не найдено.</p>
      </div>
    );

  return <Winner event={event} />;
}
