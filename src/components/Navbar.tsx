import { useState, useEffect, useRef } from "react";
import { LogOut, BookOpen, Library, X, Menu } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Avatar } from "@/components/Avatar";
import { SignInButton } from "@/components/SignInButton";
import { NotificationBell } from "@/components/NotificationBell";

type AppView = "home" | "past" | "library";

export function Navbar({
  currentView,
  onScrollTo,
  onNavigate,
}: {
  currentView: AppView;
  onScrollTo: (id: string) => void;
  onNavigate: (view: AppView) => void;
}) {
  const { user, logOut } = useAuth();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropdownOpen]);

  const navLinks: { label: string; action: () => void; active?: boolean }[] = [
    {
      label: t("nav.thisMonth"),
      action: () => onScrollTo("book"),
      active: currentView === "home",
    },
    {
      label: t("nav.howItWorks"),
      action: () => onScrollTo("howitworks"),
      active: currentView === "home",
    },
    {
      label: "Library",
      action: () => onNavigate("library"),
      active: currentView === "library",
    },
    {
      label: t("past.title"),
      action: () => onNavigate("past"),
      active: currentView === "past",
    },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-gray-100"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center h-16">
        {/* Left spacer — keeps links truly centred */}
        <div className="flex-1" />

        {/* Desktop links */}
        <ul className="hidden md:flex gap-1">
          {navLinks.map(({ label, action, active }) => (
            <li key={label}>
              <button
                onClick={action}
                className={`px-4 py-2 rounded-full font-['Lato',sans-serif] text-[15px] transition-all focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 ${
                  active
                    ? "text-[#219ebc] bg-[#219ebc]/8"
                    : "text-[#023047]/70 hover:text-[#219ebc] hover:bg-[#219ebc]/8"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="hidden md:block font-['Lato',sans-serif] text-sm font-bold text-[#023047]/40 hover:text-[#219ebc] transition-colors px-2"
            aria-label="Toggle language"
          >
            {lang === "en" ? "FR" : "EN"}
          </button>

          {user && <NotificationBell uid={user.uid} />}

          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40"
                aria-label="Open profile menu"
                aria-expanded={dropdownOpen}
              >
                <Avatar src={user.photoURL} name={user.displayName} size={8} />
                <span className="hidden md:block font-['Lato',sans-serif] text-sm font-bold text-[#023047]">
                  {user.displayName?.split(" ")[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm leading-none">
                      {user.displayName}
                    </p>
                    <p className="font-['Lato',sans-serif] text-[#023047]/40 text-xs mt-1">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); onNavigate("library"); }}
                      className="w-full text-left px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <Library size={14} className="text-[#219ebc]" />
                      Browse Library
                    </button>
                    <div className="h-px bg-gray-100 mx-4 my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logOut();
                        toast.success(t("auth.signOut.toast"));
                      }}
                      className="w-full text-left px-4 py-2.5 font-['Lato',sans-serif] text-sm text-red-400 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                    >
                      <LogOut size={14} />
                      {t("nav.signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <SignInButton />
          )}

          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 text-[#023047] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 py-3 space-y-1">
          {navLinks.map(({ label, action }) => (
            <button
              key={label}
              className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-[#023047]/70 hover:text-[#219ebc] hover:bg-[#219ebc]/8 transition-all"
              onClick={() => { setMenuOpen(false); action(); }}
            >
              {label}
            </button>
          ))}
          {user && (
            <button
              className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-red-400 hover:bg-red-50 transition-all"
              onClick={() => { setMenuOpen(false); logOut(); toast.success(t("auth.signOut.toast")); }}
            >
              {t("nav.signOut")}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
