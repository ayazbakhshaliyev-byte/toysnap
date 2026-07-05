import { useRef, useState } from "react";
import { prepareImageForUpload } from "../lib/imageUtils";
import { supabase, PHOTOS_BUCKET } from "../lib/supabaseClient";

export default function UploadModal({ event, guest, onClose, onUploaded }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | processing | uploading | done | error
  const [errorMsg, setErrorMsg] = useState(null);

  function handlePick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handlePublish() {
    if (!file) return;
    setStatus("processing");
    setErrorMsg(null);
    try {
      const { full, thumbnail } = await prepareImageForUpload(file);

      setStatus("uploading");
      const stamp = Date.now();
      const base = `${event.code}/${guest.id}/${stamp}`;
      const fullPath = `${base}.jpg`;
      const thumbPath = `${base}_thumb.jpg`;

      const { error: fullErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(fullPath, full, { contentType: "image/jpeg" });
      if (fullErr) throw fullErr;

      const { error: thumbErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(thumbPath, thumbnail, { contentType: "image/jpeg" });
      if (thumbErr) throw thumbErr;

      const { data: photoRow, error: insertErr } = await supabase
        .from("photos")
        .insert({
          event_id: event.id,
          guest_id: guest.id,
          image_path: fullPath,
          thumbnail_path: thumbPath,
        })
        .select("*, guests(full_name)")
        .single();
      if (insertErr) throw insertErr;

      setStatus("done");
      onUploaded(photoRow);
      setTimeout(onClose, 900);
    } catch (e) {
      setStatus("error");
      setErrorMsg(
        e.message?.includes("лимит")
          ? "Вы достигли лимита в 30 фото за это событие."
          : "Не получилось опубликовать фото. Проверьте связь и попробуйте снова."
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-slate/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
      <div className="w-full sm:max-w-md bg-ivory rounded-t-2xl sm:rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif italic text-2xl text-slate">Поделиться моментом</h2>
          <button onClick={onClose} className="text-slate/40 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={handleFileChange}
        />

        {!preview && (
          <button
            onClick={handlePick}
            className="w-full h-40 rounded-xl border-2 border-dashed border-sage/50 bg-warm-beige/40
                       flex flex-col items-center justify-center gap-2 text-slate/60 font-sans"
          >
            <span className="text-3xl">✦</span>
            <span>Сделать фото или выбрать из галереи</span>
          </button>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden aspect-square bg-warm-beige">
              <img src={preview} alt="Предпросмотр" className="w-full h-full object-cover" />
            </div>

            {errorMsg && <p className="text-sm text-dusty-rose text-center">{errorMsg}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setStatus("idle");
                }}
                disabled={status === "processing" || status === "uploading"}
                className="flex-1 h-14 rounded-lg border border-champagne text-slate font-sans"
              >
                Заменить
              </button>
              <button
                onClick={handlePublish}
                disabled={status === "processing" || status === "uploading" || status === "done"}
                className="flex-1 h-14 rounded-lg bg-dusty-rose text-white font-sans disabled:opacity-50"
              >
                {status === "processing" && "Готовим фото…"}
                {status === "uploading" && "Публикуем…"}
                {status === "done" && "Момент сохранён ✦"}
                {(status === "idle" || status === "error") && "Опубликовать"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
