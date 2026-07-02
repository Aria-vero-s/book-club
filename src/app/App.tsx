import { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/pages/HomePage";
import { PastReadsPage } from "@/pages/PastReadsPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { seedFirestore, seedUserData } from "@/services/seed";
import imgLanding from "@/imports/1920WLight/61f9d38cef5dfc577b507b3f35af5181e51ce63b.png";

const ENABLE_CLIENT_SEED = import.meta.env.VITE_ENABLE_CLIENT_SEED === "true";

type AppView = "home" | "past" | "library";

function AppShell() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>("home");
  const pendingScroll = useRef<string | null>(null);

  useEffect(() => {
    if (!ENABLE_CLIENT_SEED) return;
    seedFirestore();
  }, []);

  useEffect(() => {
    if (!ENABLE_CLIENT_SEED || !user) return;
    if (user.displayName?.toLowerCase().includes("ariane")) {
      seedUserData(user.uid);
    }
  }, [user?.uid]);

  // After returning to home, execute any pending scroll
  useEffect(() => {
    if (view === "home" && pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: "smooth" });
      }, 80);
    }
  }, [view]);

  const scrollTo = (id: string) => {
    if (view !== "home") {
      pendingScroll.current = id;
      setView("home");
    } else {
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: "smooth" });
    }
  };

  const navigate = (v: AppView) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-5">
        <img src={imgLanding} alt="" className="w-48 opacity-20" aria-hidden="true" />
        <div className="w-8 h-8 border-[3px] border-[#219ebc] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            closeButton:
              "!left-auto !right-2 !top-1/2 !-translate-y-1/2 !translate-x-0",
          },
        }}
      />
      <Navbar currentView={view} onScrollTo={scrollTo} onNavigate={navigate} />

      <main>
        {view === "past" ? (
          <PastReadsPage onBack={() => navigate("home")} />
        ) : view === "library" ? (
          <LibraryPage onBack={() => navigate("home")} />
        ) : (
          <HomePage onNavigate={navigate} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </LanguageProvider>
  );
}
