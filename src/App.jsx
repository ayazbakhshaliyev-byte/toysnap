import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EventGate from "./pages/EventGate";
import WinnerGate from "./pages/WinnerGate";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminQR from "./pages/admin/AdminQR";

function Landing() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <p className="font-serif italic text-slate/50 text-lg text-center">
        Отсканируйте QR-код на вашем столе, чтобы открыть альбом ✦
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/event/:code" element={<EventGate />} />
        <Route path="/event/:code/winner" element={<WinnerGate />} />
        <Route path="/admin/:code" element={<AdminLogin />} />
        <Route path="/admin/:code/qr" element={<AdminQR />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
