import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { BottomNav, type Page } from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AdminPage } from "./pages/AdminPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { RiderPage } from "./pages/RiderPage";
import { TrackPage } from "./pages/TrackPage";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [_activeOrderId, setActiveOrderId] = useState<bigint | null>(null);
  const { login, clear, isLoggingIn, identity, isInitializing } =
    useInternetIdentity();

  const handleOrderCreated = (orderId: bigint) => {
    setActiveOrderId(orderId);
  };

  const handleNavigateTrack = () => {
    setPage("track");
  };

  return (
    <div className="porter-app" style={{ paddingBottom: "64px" }}>
      {/* Auth bar */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40"
        style={{ display: "none" }}
      />

      {/* Login button — floating if not logged in */}
      {!isInitializing && !identity && (
        <div
          className="fixed top-4 right-4 z-40"
          style={{ right: "max(1rem, calc(50vw - 225px))" }}
        >
          <Button
            size="sm"
            onClick={login}
            disabled={isLoggingIn}
            className="orange-bg shadow-orange text-xs font-bold rounded-full px-4"
          >
            {isLoggingIn ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogIn size={14} />
            )}
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </div>
      )}

      {identity && (
        <div
          className="fixed top-4 right-4 z-40"
          style={{ right: "max(1rem, calc(50vw - 225px))" }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={clear}
            className="text-xs font-bold rounded-full px-4 bg-white/10 text-white hover:bg-white/20"
          >
            <LogOut size={14} />
            Logout
          </Button>
        </div>
      )}

      {/* Pages */}
      <main style={{ minHeight: "calc(100dvh - 64px)" }}>
        {page === "home" && (
          <HomePage
            onOrderCreated={handleOrderCreated}
            onNavigateTrack={handleNavigateTrack}
          />
        )}
        {page === "track" && <TrackPage />}
        {page === "history" && <HistoryPage />}
        {page === "rider" && <RiderPage />}
        {page === "admin" && <AdminPage />}
      </main>

      <BottomNav current={page} onNavigate={setPage} />
      <Toaster richColors position="top-center" />
    </div>
  );
}
