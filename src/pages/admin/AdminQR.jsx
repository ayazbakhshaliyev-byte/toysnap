import { useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminQR() {
  const { code } = useParams();
  const canvasWrapRef = useRef(null);
  const url = `${window.location.origin}/event/${code}`;

  function download() {
    const canvas = canvasWrapRef.current.querySelector("canvas");
    const link = document.createElement("a");
    link.download = `qr-${code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center px-6 gap-6">
      <h1 className="font-serif italic text-3xl text-slate text-center">QR-код для столов</h1>
      <div
        ref={canvasWrapRef}
        className="p-6 bg-white rounded-xl border border-champagne shadow-soft [&>canvas]:w-64 [&>canvas]:h-64"
      >
        <QRCodeCanvas value={url} size={1024} level="H" includeMargin bgColor="#FFFFFF" fgColor="#3A3A3A" />
      </div>
      <p className="text-slate/50 font-sans text-sm break-all text-center max-w-sm">{url}</p>
      <button onClick={download} className="h-14 px-8 rounded-lg bg-slate text-ivory font-sans">
        Скачать PNG для печати
      </button>
    </div>
  );
}
