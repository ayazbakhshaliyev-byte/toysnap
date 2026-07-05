import { useParams } from "react-router-dom";
import { useGuestSession } from "../hooks/useGuestSession";
import Entry from "./Entry";
import Gallery from "./Gallery";

export default function EventGate() {
  const { code } = useParams();
  const { loading, event, guest, error, registerGuest } = useGuestSession(code);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-serif italic text-slate/50 text-lg">Открываем альбом…</p>
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

  return <Gallery event={event} guest={guest} />;
}
