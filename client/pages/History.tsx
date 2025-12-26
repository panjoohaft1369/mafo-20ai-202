import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { HistoryModal } from "@/components/HistoryModal";
import { getAuthState, clearAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

export default function History() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const [historyOpen, setHistoryOpen] = useState(true);

  // Redirect if not logged in
  if (!auth.isLoggedIn || !auth.apiKey) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Close modal and redirect to generate page
  const handleCloseModal = () => {
    setHistoryOpen(false);
    navigate("/generate");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <HistoryModal
        open={historyOpen}
        onOpenChange={handleCloseModal}
        apiKey={auth.apiKey!}
      />

      <BottomNav isLoggedIn={true} onLogout={handleLogout} />
    </div>
  );
}
