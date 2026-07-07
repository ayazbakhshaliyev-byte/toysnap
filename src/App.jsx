import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./lib/i18n/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import EventGate from "./pages/EventGate";
import WinnerGate from "./pages/WinnerGate";
import GuestProfile from "./pages/GuestProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminQR from "./pages/admin/AdminQR";

function Landing() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <p className="font-serif italic text-slate/50 text-lg text-center">{t("landing")}</p>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/event/:code" element={<EventGate />} />
          <Route path="/event/:code/guest/:guestId" element={<GuestProfile />} />
          <Route path="/event/:code/winner" element={<WinnerGate />} />
          <Route path="/admin/:code" element={<AdminLogin />} />
          <Route path="/admin/:code/qr" element={<AdminQR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
