import { useRef, useState } from "react";
import { prepareImageForUpload, extensionForFile } from "../lib/imageUtils";
import { supabase, PHOTOS_BUCKET } from "../lib/supabaseClient";
import { useLanguage } from "../lib/i18n/LanguageContext";

const CAPTION_LIMIT = 200;

export default function UploadModal({ event, guest, onClose, onUploaded }) {
  const { t } = useLanguage();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

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
      const { full, thumbnail, original } = await prepareImageForUpload(file);

      setStatus("uploading");
      const stamp = Date.now();
      const base = `${event.code}/${guest.id}/${stamp}`;
      const fullPath = `${base}.jpg`;
      const thumbPath = `${base}_thumb.jpg`;
      const originalPath = `${base}_original.${extensionForFile(original)}`;

      const { error: fullErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(fullPath, full, { contentType: "image/jpeg" });
      if (fullErr) throw fullErr;

      const { error: thumbErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(thumbPath, thumbnail, { contentType: "image/jpeg" });
      if (thumbErr) throw thumbErr;

      const { error: originalErr } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(originalPath, original, { contentType: original.type || "image/jpeg" });
      if (originalErr) throw originalErr;

      const { data: photoRow, error: insertErr } = await supabase
        .from("photos")
        .insert({
          event_id: event.id,
          guest_id: guest.id,
          image_path: fullPath,
          thumbnail_path: thumbPath,
          original_path: originalPath,
          caption: caption.trim() || null,
        })
        .select("*, guests(full_name)")
        .single();
      if (insertErr) throw insertErr;

      setStatus("done");
      onUploaded(photoRow);
      setTimeout(onClose, 900);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message?.includes("лимит") ? t("upload.limitError") : t("upload.genericError"));
    }
  }

  function resetToChoose() {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setErrorMsg(null);
  }

  return (
    <div
      className="fixed inset-0 bg-ink/45 flex items-end justify-center z-50 animate-fade-up"
      onClick={preview ? undefined : onClose}
    >
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <input ref={galleryInputRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={handleFileChange} />

      <div
        className="w-full max-h-[88%] flex flex-col bg-sheet rounded-t-[22px] shadow-soft-hover overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none px-5 pt-4 pb-4 border-b border-gold/25">
          <div className="w-[42px] h-1 rounded-full bg-gold/40 mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <span className="font-sans text-[9px] font-semibold tracking-[0.24em] uppercase text-gold">
              {t("upload.shareTitle")}
            </span>
            <button onClick={onClose} className="text-dim" aria-label={t("photoCard.close")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!preview ? (
          <div className="px-5 py-4 space-y-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center gap-4 p-4 bg-paper border border-gold/40 text-left"
            >
              <span className="flex-none w-11 h-11 rounded-full border border-gold flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a9853f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                  <circle cx="12" cy="13" r="3.3" />
                </svg>
              </span>
              <span>
                <span className="block font-serif italic text-[17px] text-ink">{t("upload.optCamera")}</span>
                <span className="block font-sans text-[11px] text-dim mt-0.5">{t("upload.optCameraSub")}</span>
              </span>
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full flex items-center gap-4 p-4 bg-paper border border-gold/40 text-left"
            >
              <span className="flex-none w-11 h-11 rounded-full border border-gold flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a9853f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="M20 15l-5-5-9 9" />
                </svg>
              </span>
              <span>
                <span className="block font-serif italic text-[17px] text-ink">{t("upload.optGallery")}</span>
                <span className="block font-sans text-[11px] text-dim mt-0.5">{t("upload.optGallerySub")}</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-4">
            <div className="bg-champagne/40 border border-gold/40 overflow-hidden">
              <img src={preview} alt="Предпросмотр" className="w-full h-auto max-h-80 object-contain mx-auto" />
            </div>

            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_LIMIT))}
                placeholder={t("upload.captionPlaceholder")}
                rows={2}
                className="w-full px-3.5 py-3 bg-white border border-gold/45 resize-none
                           font-serif text-[15px] text-ink placeholder:text-dim/60 focus:outline-none"
              />
              <p className="text-right font-sans text-[10px] text-dim/70 mt-1">
                {caption.length}/{CAPTION_LIMIT}
              </p>
            </div>

            {errorMsg && <p className="font-sans text-sm text-blush text-center">{errorMsg}</p>}

            <div className="flex gap-3">
              <button
                onClick={resetToChoose}
                disabled={status === "processing" || status === "uploading"}
                className="flex-1 py-3.5 border border-gold/50 text-ink
                           font-sans text-[9.5px] font-semibold tracking-[0.18em] uppercase disabled:opacity-40"
              >
                {t("upload.replace")}
              </button>
              <button
                onClick={handlePublish}
                disabled={status === "processing" || status === "uploading" || status === "done"}
                className="flex-1 py-3.5 bg-forest text-paper
                           font-sans text-[9.5px] font-semibold tracking-[0.18em] uppercase disabled:opacity-50"
              >
                {status === "processing" && t("upload.processing")}
                {status === "uploading" && t("upload.uploading")}
                {status === "done" && t("upload.done")}
                {(status === "idle" || status === "error") && t("upload.publish")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
