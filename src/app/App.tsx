import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import {
  Star,
  LogOut,
  User as UserIcon,
  BookOpen,
  Check,
  Edit2,
  Trash2,
  X,
  Menu,
  Users,
  CheckCheck,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  Bell,
  MessageCircle,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { db } from "@/lib/firebase";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider, useLang } from "@/contexts/LanguageContext";

import imgLanding from "@/imports/1920WLight/61f9d38cef5dfc577b507b3f35af5181e51ce63b.png";
import imgEthos from "@/imports/1920WLight/e07f166570be5a1cfe58162c1e0f069c18b250d6.png";
import img1 from "@/imports/1920WLight/02fcd00bcd724eecf83f5f9db77efaa918c241bf.png";
import imgGirlReading from "@/imports/girl_reading.jpeg";
import imgSpeechBubble from "@/imports/speech_bubble.jpeg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  month: number;
  year: number;
  isCurrent: boolean;
}

interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  text: string;
  createdAt: Timestamp | null;
}

interface ReadingStatus {
  id: string;
  userId: string;
  bookId: string;
  status: "reading" | "finished";
}

interface Vote {
  id: string;
  userId: string;
  bookId: string;
}

interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  createdAt: Timestamp | null;
}

interface Support {
  id: string;
  userId: string;
  suggestionId: string;
  suggestionOwnerId: string;
}

interface Reply {
  id: string;
  reviewId: string;
  bookId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: Timestamp | null;
}

interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: "reply" | "support" | "token";
  // reply fields
  bookId?: string;
  bookTitle?: string;
  reviewId?: string;
  replyText?: string;
  // support fields
  suggestionId?: string;
  suggestionTitle?: string;
  // token fields
  tokenAmount?: number;
  reason?: string;
  read: boolean;
  createdAt: Timestamp | null;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const MAX_REVIEW = 500;
const MAX_SUGGESTION_DESC = 200;
const ENABLE_CLIENT_SEED = import.meta.env.VITE_ENABLE_CLIENT_SEED === "true";

// Award tokens to a user — always toast silently, never block UI
// Pass statField to also increment a stats counter (e.g. "booksFinished")
async function awardTokens(uid: string, amount: number, message: string, statField?: string) {
  try {
    const data: Record<string, unknown> = { tokenBalance: increment(amount) };
    if (statField) data[statField] = increment(1);
    await updateDoc(doc(db, "users", uid), data);
    toast.success(message, { duration: 2500 });
  } catch { /* silent — never block the primary action */ }
}

// Subscribe to a user's token balance
function useTokenBalance(uid?: string) {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      doc(db, "users", uid),
      (snap) => { setBalance(snap.data()?.tokenBalance ?? 0); },
      () => { /* permission-denied expected when not signed in */ }
    );
  }, [uid]);
  return balance;
}

function useNotifications(uid?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "notifications"), where("recipientId", "==", uid)),
      (snap) => {
        const n = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
        n.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setNotifications(n);
      },
      () => { /* permission-denied expected when not signed in */ }
    );
  }, [uid]);
  return notifications;
}

function relativeTime(ts: Timestamp | null): string {
  if (!ts?.toDate) return "";
  try {
    return formatDistanceToNow(ts.toDate(), { addSuffix: true });
  } catch {
    return "";
  }
}

// ─── Skeleton primitives ──────────────────────────────────────────────────────

function Pulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className ?? ""}`} />
  );
}

function BookSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8">
      <Pulse className="w-44 h-64 rounded-2xl flex-shrink-0 mx-auto md:mx-0" />
      <div className="flex-1 space-y-4 pt-2">
        <Pulse className="h-4 w-32 rounded-full" />
        <Pulse className="h-8 w-3/4" />
        <Pulse className="h-5 w-1/3" />
        <Pulse className="h-4 w-24 rounded-full" />
        <div className="space-y-2 pt-2">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-4/6" />
        </div>
        <div className="flex gap-3 pt-4">
          <Pulse className="h-10 w-32 rounded-full" />
          <Pulse className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
      <Pulse className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-3 w-20 rounded-full" />
        <Pulse className="h-4 w-full mt-3" />
        <Pulse className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const { t } = useLang();
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="flex gap-0.5"
      role={readonly ? "img" : "group"}
      aria-label={readonly ? `${value} out of 5 stars` : "Rate this book"}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          aria-label={`${s} star${s !== 1 ? "s" : ""}`}
          className={`transition-transform duration-100 ${
            readonly ? "cursor-default pointer-events-none" : "cursor-pointer hover:scale-110 focus:outline-none focus:scale-110"
          }`}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(s)}
        >
          <Star
            size={size}
            className={`transition-colors duration-100 ${
              active >= s ? "fill-[#ffb703] text-[#ffb703]" : "fill-transparent text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── User Avatar ──────────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = 10,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const dim = `w-${size} h-${size}`;
  if (src) {
    return (
      <img
        src={
          src?.includes("pravatar.cc") && !src.includes("?u=")
            ? `${src}?u=${encodeURIComponent(name ?? src)}`
            : src
        }
        alt={name ?? "User"}
        className={`${dim} rounded-full object-cover ring-2 ring-white flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-[#219ebc] flex items-center justify-center flex-shrink-0 ring-2 ring-white`}
    >
      <UserIcon size={size * 2} className="text-white" />
    </div>
  );
}

// ─── Google Sign-In Button ────────────────────────────────────────────────────

function SignInButton({ large = false }: { large?: boolean }) {
  const { signIn } = useAuth();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await signIn();
        } catch (err: unknown) {
          const code = (err as { code?: string }).code ?? "";
          if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
          if (code === "auth/unauthorized-domain") {
            toast.error("This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorised domains.");
          } else {
            toast.error(t("auth.signIn.error") + (code || "unknown error"));
          }
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      aria-label="Continue with Google"
      className={`inline-flex items-center gap-2.5 bg-[#219ebc] text-white font-['Lato',sans-serif] font-bold rounded-full transition-all hover:bg-[#1a8fa8] hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
        large ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm"
      }`}
    >
      <svg width={large ? 20 : 16} height={large ? 20 : 16} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.9)" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.9)" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.9)" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.9)" />
      </svg>
      {loading ? t("auth.signingIn") : t("auth.continue")}
    </button>
  );
}

// ─── Notification Bell ───────────────────────────────────────────────────────

function NotificationBell({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotifications(uid);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const markRead = (id: string) =>
    updateDoc(doc(db, "notifications", id), { read: true });

  const dismiss = (id: string) =>
    deleteDoc(doc(db, "notifications", id));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-2 rounded-full hover:bg-gray-100 text-[#023047]/50 hover:text-[#023047] transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#219ebc] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 w-80 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-['Quando',serif] text-[#023047] text-sm">Notifications</p>
            {unread > 0 && (
              <span className="font-['Lato',sans-serif] text-xs text-[#023047]/40">{unread} unread</span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-['Lato',sans-serif] text-[#023047]/35 text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 items-start transition-colors ${!n.read ? "bg-[#f4fafb]" : "bg-white"}`}
                >
                  <Avatar src={n.senderPhoto} name={n.senderName} size={8} />
                  <div className="flex-1 min-w-0">
                    {n.type === "support" ? (
                      <p className="font-['Lato',sans-serif] text-xs text-[#023047]/70 leading-relaxed">
                        <span className="font-bold text-[#023047]">{n.senderName}</span>
                        {" supported your suggestion "}
                        <span className="font-bold text-[#023047]">{n.suggestionTitle}</span>
                        {" (+2 tokens)"}
                      </p>
                    ) : (
                      <>
                        <p className="font-['Lato',sans-serif] text-xs text-[#023047]/70 leading-relaxed">
                          <span className="font-bold text-[#023047]">{n.senderName}</span>
                          {" replied to your review of "}
                          <span className="font-bold text-[#023047]">{n.bookTitle}</span>
                        </p>
                        {n.replyText && (
                          <p className="font-['Lato',sans-serif] text-xs text-[#023047]/40 mt-0.5 line-clamp-1 italic">
                            &ldquo;{n.replyText}&rdquo;
                          </p>
                        )}
                      </>
                    )}
                    <p className="font-['Lato',sans-serif] text-[10px] text-[#023047]/30 mt-1">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        aria-label="Mark as read"
                        title="Mark as read"
                        className="p-1.5 rounded-full hover:bg-[#219ebc]/10 text-[#219ebc] transition-colors"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(n.id)}
                      aria-label="Dismiss notification"
                      title="Dismiss"
                      className="p-1.5 rounded-full hover:bg-red-50 text-[#023047]/25 hover:text-red-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  onProfile,
  onScrollTo,
}: {
  onProfile: () => void;
  onScrollTo: (id: string) => void;
}) {
  const { user, logOut } = useAuth();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const navLinks = [
    { label: t("nav.thisMonth"), id: "book" },
    { label: t("nav.howItWorks"), id: "howitworks" },
    { label: t("nav.suggestions"), id: "suggestions" },
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
          {navLinks.map(({ label, id }) => (
            <li key={id}>
              <button
                onClick={() => onScrollTo(id)}
                className="px-4 py-2 rounded-full font-['Lato',sans-serif] text-[15px] text-[#023047]/70 hover:text-[#219ebc] hover:bg-[#219ebc]/8 transition-all focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side — flex-1 so it mirrors the left spacer */}
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
              {/* Profile trigger */}
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

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm leading-none">{user.displayName}</p>
                    <p className="font-['Lato',sans-serif] text-[#023047]/40 text-xs mt-1">{user.email}</p>
                  </div>
                  {/* Actions */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); onProfile(); }}
                      className="w-full text-left px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <BookOpen size={14} className="text-[#219ebc]" />
                      {t("nav.suggestBook")}
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); onScrollTo("suggestions"); }}
                      className="w-full text-left px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <Check size={14} className="text-[#219ebc]" />
                      {t("nav.vote")}
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); photoInputRef.current?.click(); }}
                      className="w-full text-left px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <UserIcon size={14} className="text-[#219ebc]" />
                      {t("nav.editPicture")}
                    </button>
                    <div className="h-px bg-gray-100 mx-4 my-1" />
                    <button
                      onClick={() => { setDropdownOpen(false); logOut(); toast.success(t("auth.signOut.toast")); }}
                      className="w-full text-left px-4 py-2.5 font-['Lato',sans-serif] text-sm text-red-400 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                    >
                      <LogOut size={14} />
                      {t("nav.signOut")}
                    </button>
                  </div>

                  {/* Hidden photo upload input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        setDoc(doc(db, "users", user.uid), { photoURL: dataUrl }, { merge: true })
                          .then(() => toast.success("Profile picture updated."))
                          .catch(() => toast.error("Failed to update picture."));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
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
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-[#023047]/70 hover:text-[#219ebc] hover:bg-[#219ebc]/8 transition-all"
              onClick={() => { setMenuOpen(false); onScrollTo(id); }}
            >
              {label}
            </button>
          ))}
          {user && (
            <>
              <button
                className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-[#023047]/70 hover:bg-gray-50 transition-all"
                onClick={() => { setMenuOpen(false); onProfile(); }}
              >
                {t("nav.suggestBook")}
              </button>
              <button
                className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-[#023047]/70 hover:bg-gray-50 transition-all"
                onClick={() => { setMenuOpen(false); onScrollTo("suggestions"); }}
              >
                {t("nav.vote")}
              </button>
              <button
                className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-red-400 hover:bg-red-50 transition-all"
                onClick={() => { setMenuOpen(false); logOut(); toast.success(t("auth.signOut.toast")); }}
              >
                {t("nav.signOut")}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const { user } = useAuth();
  const { t } = useLang();

  return (
    <section id="hero" className="pt-16 bg-white">
      {/* Logo illustration */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-4 flex justify-center">
        <img
          src={imgLanding}
          alt="The Blue Book Club — stack of books with club logo"
          className="w-full max-w-2xl object-contain"
        />
      </div>

      {/* Tagline + CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-12 text-center">
        <p className="font-['Quando',serif] text-[#219ebc] text-xl leading-relaxed italic">
          {t("hero.tagline")}
        </p>
      </div>
    </section>
  );
}

// ─── Reading Status Picker ────────────────────────────────────────────────────

function ReadingStatusPicker({ bookId }: { bookId: string }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [status, setStatus] = useState<"reading" | "finished" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "readingStatus", `${user.uid}_${bookId}`), (snap) => {
      setStatus(snap.exists() ? (snap.data().status as "reading" | "finished") : null);
    });
  }, [user?.uid, bookId]);

  const pick = async (s: "reading" | "finished") => {
    if (!user || saving) return;
    setSaving(true);
    const prevStatus = status;
    try {
      await setDoc(doc(db, "readingStatus", `${user.uid}_${bookId}`), {
        userId: user.uid,
        bookId,
        status: s,
      });
      if (s === "finished" && prevStatus !== "finished") {
        // First time finishing: +1 token, increment booksFinished
        toast.success(t("status.toast.finished"));
        await awardTokens(user.uid, 1, t("status.toast.token"), "booksFinished");
      } else if (s === "reading" && prevStatus === "finished") {
        // Reverting from finished: deduct token, decrement booksFinished
        await updateDoc(doc(db, "users", user.uid), {
          tokenBalance: increment(-1),
          booksFinished: increment(-1),
        });
        toast.success("Reading again — 1 token removed.");
      } else {
        toast.success(t("status.toast.reading"));
      }
    } catch {
      toast.error(t("status.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40 mb-3">
        {t("status.label")}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => pick("reading")}
          disabled={saving}
          aria-pressed={status === "reading"}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-['Lato',sans-serif] text-sm font-bold transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#219ebc]/50 ${
            status === "reading"
              ? "bg-[#219ebc] border-[#219ebc] text-white shadow-md shadow-[#219ebc]/20"
              : "bg-white border-gray-200 text-[#023047]/60 hover:border-[#219ebc] hover:text-[#219ebc] hover:bg-[#219ebc]/5"
          } disabled:opacity-60`}
        >
          <Check size={15} />
          {t("status.reading")}
        </button>
        <button
          onClick={() => pick("finished")}
          disabled={saving}
          aria-pressed={status === "finished"}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-['Lato',sans-serif] text-sm font-bold transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#023047]/30 ${
            status === "finished"
              ? "bg-[#023047] border-[#023047] text-white shadow-md shadow-[#023047]/15"
              : "bg-white border-gray-200 text-[#023047]/60 hover:border-[#023047] hover:text-[#023047] hover:bg-[#023047]/5"
          } disabled:opacity-60`}
        >
          <BookOpen size={15} />
          {t("status.finished")}
        </button>
      </div>
    </div>
  );
}

// ─── Book of the Month ────────────────────────────────────────────────────────

function BookOfMonth() {
  const { user } = useAuth();
  const { t } = useLang();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusCounts, setStatusCounts] = useState({ reading: 0, finished: 0 });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [userFinished, setUserFinished] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "books"), where("isCurrent", "==", true));
    return onSnapshot(
      q,
      (snap) => {
        setLoadFailed(false);
        setBook(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Book));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load current book from Firestore:", err);
        const fallback = SEED_BOOKS.find((b) => b.isCurrent) ?? null;
        setBook(fallback);
        setLoadFailed(true);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!book) return;
    const rq = query(collection(db, "reviews"), where("bookId", "==", book.id));
    const unsub1 = onSnapshot(rq, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      docs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      setReviews(docs);
    });
    const sq = query(collection(db, "readingStatus"), where("bookId", "==", book.id));
    const unsub2 = onSnapshot(sq, (snap) => {
      const docs = snap.docs.map((d) => d.data());
      setStatusCounts({
        reading: docs.filter((d) => d.status === "reading").length,
        finished: docs.filter((d) => d.status === "finished").length,
      });
    });
    return () => { unsub1(); unsub2(); };
  }, [book?.id]);

  // Track whether the current user has finished this book
  useEffect(() => {
    if (!user || !book) { setUserFinished(false); return; }
    return onSnapshot(
      doc(db, "readingStatus", `${user.uid}_${book.id}`),
      (snap) => setUserFinished(snap.exists() && (snap.data()?.status as string) === "finished"),
      () => setUserFinished(false)
    );
  }, [user?.uid, book?.id]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section id="book" className="py-16 bg-[#f4fafb]">
      <div className="max-w-4xl mx-auto px-5">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-[#219ebc]/20" />
          <span className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#219ebc]">
            {t("book.label")}
          </span>
          <div className="h-px flex-1 bg-[#219ebc]/20" />
        </div>

        {loading ? (
          <BookSkeleton />
        ) : !book ? (
          /* Empty state */
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <h2 className="font-['Quando',serif] text-[#023047] text-2xl mb-3">
              {t("book.noBook.title")}
            </h2>
            <p className="font-['Lato',sans-serif] text-[#023047]/50 max-w-sm mx-auto leading-relaxed">
              {t("book.noBook.desc")}
            </p>
            <p className="font-['Lato',sans-serif] text-[#023047]/35 text-sm max-w-xs mx-auto mt-3">
              {t("book.noBook.hint")}
            </p>
          </div>
        ) : (
          <>
            {loadFailed && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="font-['Lato',sans-serif] text-sm text-amber-800">
                  Live data could not be loaded from Firebase. Showing local fallback data.
                </p>
              </div>
            )}
            {/* Main book card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row gap-0">
                {/* Cover column */}
                <div className="md:w-56 flex-shrink-0 bg-gradient-to-br from-[#023047] to-[#034a6e] flex items-center justify-center p-8 md:p-10 min-h-[220px]">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`Cover of ${book.title}`}
                      className="w-36 md:w-full rounded-xl shadow-2xl object-cover aspect-[2/3]"
                    />
                  ) : (
                    <div className="w-36 md:w-full rounded-xl bg-white/10 flex items-center justify-center aspect-[2/3]">
                      <BookOpen size={40} className="text-white/50" />
                    </div>
                  )}
                </div>

                {/* Info column */}
                <div className="flex-1 p-7 md:p-9">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-[#ffb703]/20 text-[#a07800] font-['Lato',sans-serif] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      {new Date(book.year, book.month - 1).toLocaleString("en-US", { month: "long" })} {book.year}
                    </span>
                  </div>

                  <h2 className="font-['Quando',serif] text-[#023047] text-3xl md:text-4xl leading-tight mb-2">
                    {book.title}
                  </h2>
                  <p className="font-['Lato',sans-serif] text-[#023047]/50 text-lg mb-5">
                    by {book.author}
                  </p>

                  {/* Rating summary */}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-3 mb-5">
                      <StarRating value={Math.round(avgRating)} readonly size={16} />
                      <span className="font-['Lato',sans-serif] text-[#023047] font-bold">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
                        ({reviews.length} {reviews.length === 1 ? t("stats.review") : t("stats.reviews")})
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {book.description && (
                    <div className="mb-6">
                      <p className={`font-['Lato',sans-serif] text-[#023047]/70 leading-relaxed text-[15px] ${descExpanded ? "" : "line-clamp-3"}`}>
                        {book.description}
                      </p>
                      {book.description.length > 160 && (
                        <button
                          onClick={() => setDescExpanded((v) => !v)}
                          className="mt-1.5 font-['Lato',sans-serif] text-[#219ebc] text-sm font-bold hover:underline focus:outline-none"
                        >
                          {descExpanded ? t("book.showLess") : t("book.readMore")}
                        </button>
                      )}
                    </div>
                  )}

                  {user ? (
                    <ReadingStatusPicker bookId={book.id} />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-[#f4fafb] rounded-2xl border border-[#219ebc]/15">
                      <BookOpen size={18} className="text-[#219ebc] flex-shrink-0" />
                      <p className="font-['Lato',sans-serif] text-[#023047]/60 text-sm">
                        <button
                          onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                          className="text-[#219ebc] font-bold hover:underline"
                        >
                          {t("auth.signIn")}
                        </button>{" "}
                        {t("book.signInPrompt.text")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Community stats strip */}
              <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
                <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                  <Users size={15} className="text-[#219ebc] flex-shrink-0" />
                  <div>
                    <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">{statusCounts.reading}</span>
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">{t("stats.reading")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                  <CheckCheck size={15} className="text-[#219ebc] flex-shrink-0" />
                  <div>
                    <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">{statusCounts.finished}</span>
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">{t("stats.finished")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                  <MessageSquare size={15} className="text-[#219ebc] flex-shrink-0" />
                  <div>
                    <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">{reviews.length}</span>
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">{reviews.length === 1 ? t("stats.review") : t("stats.reviews")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {user && (
              <ReviewSection bookId={book.id} bookTitle={book.title} reviews={reviews} userFinished={userFinished} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────────────

function ReviewForm({
  bookId,
  bookTitle,
  existing,
  onDone,
}: {
  bookId: string;
  bookTitle: string;
  existing?: Review;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const { t } = useLang();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? "");
  const [saving, setSaving] = useState(false);
  const remaining = MAX_REVIEW - text.length;

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error(t("reviews.ratingError"));
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateDoc(doc(db, "reviews", existing.id), { rating, text });
        toast.success(t("reviews.updated"));
      } else {
        await addDoc(collection(db, "reviews"), {
          bookId,
          userId: user.uid,
          userName: user.displayName ?? "Anonymous",
          userPhoto: user.photoURL ?? "",
          rating,
          text,
          createdAt: serverTimestamp(),
        });
        toast.success(t("reviews.posted"));
        await awardTokens(user.uid, 1, t("reviews.token"));
      }
      onDone();
    } catch {
      toast.error(t("reviews.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Star picker */}
      <div>
        <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40 mb-3">
          {t("reviews.ratingLabel")}
        </p>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size={30} />
          {rating > 0 && (
            <span className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
              {["", t("rating.1"), t("rating.2"), t("rating.3"), t("rating.4"), t("rating.5")][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40">
            {t("reviews.thoughtsLabel")} <span className="normal-case tracking-normal font-normal">({t("reviews.optional")})</span>
          </p>
          {text.length > 0 && (
            <span className={`font-['Lato',sans-serif] text-xs tabular-nums ${remaining < 50 ? "text-red-400" : "text-[#023047]/30"}`}>
              {remaining} {t("reviews.charsLeft")}
            </span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_REVIEW))}
          placeholder={`${t("reviews.placeholder")} ${bookTitle}?`}
          rows={4}
          aria-label="Write your review"
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 font-['Lato',sans-serif] text-[#023047] text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc]/40 transition-all placeholder:text-[#023047]/25"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving || rating === 0}
          className="px-6 py-2.5 bg-[#219ebc] text-white rounded-full font-['Lato',sans-serif] text-sm font-bold hover:bg-[#1a8fa8] hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#219ebc]/60"
          title={rating === 0 ? "Select a star rating first" : undefined}
        >
          {saving ? t("reviews.saving") : existing ? t("reviews.updateReview") : t("reviews.postReview")}
        </button>
        {(existing || text) && (
          <button
            onClick={onDone}
            className="px-5 py-2.5 rounded-full font-['Lato',sans-serif] text-sm text-[#023047]/50 hover:text-[#023047] hover:bg-gray-100 transition-all"
          >
            {t("reviews.cancel")}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isOwn,
  onEdit,
  onDelete,
  deleting,
}: {
  review: Review;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const time = relativeTime(review.createdAt);

  return (
    <article
      className={`bg-white rounded-2xl border p-6 transition-all ${
        isOwn ? "border-[#219ebc]/25 ring-1 ring-[#219ebc]/15" : "border-gray-100"
      }`}
      aria-label={`Review by ${review.userName}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={review.userPhoto} name={review.userName} size={10} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm leading-none">
                {review.userName}
              </p>
              {isOwn && (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-[#219ebc]/10 text-[#219ebc] px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating value={review.rating} readonly size={13} />
              {time && (
                <span className="text-xs text-[#023047]/30 font-['Lato',sans-serif]">
                  {time}
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwn && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={onEdit}
              aria-label="Edit review"
              className="p-2 rounded-full text-[#023047]/30 hover:text-[#219ebc] hover:bg-[#219ebc]/8 transition-all"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete review"
              className="p-2 rounded-full text-[#023047]/30 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-40"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {review.text && (
        <p className="font-['Lato',sans-serif] text-[#023047]/75 leading-relaxed text-[15px] pl-[52px]">
          {review.text}
        </p>
      )}
    </article>
  );
}

// ─── Review Section ───────────────────────────────────────────────────────────

function ReviewSection({
  bookId,
  bookTitle,
  reviews,
  userFinished = false,
}: {
  bookId: string;
  bookTitle: string;
  reviews: Review[];
  userFinished?: boolean;
}) {
  const { user } = useAuth();
  const { t } = useLang();
  const myReview = reviews.find((r) => r.userId === user?.uid);
  const otherReviews = reviews.filter((r) => r.userId !== user?.uid);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!myReview) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "reviews", myReview.id));
      toast.success("Review removed.");
    } catch {
      toast.error("Couldn't delete review. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-10 space-y-5">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h3 className="font-['Quando',serif] text-[#023047] text-xl">
          {t("reviews.title")}
          {reviews.length > 0 && (
            <span className="ml-2 font-['Lato',sans-serif] font-normal text-base text-[#023047]/40">
              ({reviews.length})
            </span>
          )}
        </h3>
      </div>

      {/* My review / form */}
      <div className="bg-white rounded-2xl border border-[#219ebc]/20 p-6">
        {!userFinished && !myReview ? (
          <div className="flex items-center gap-3 py-2">
            <BookOpen size={16} className="text-[#219ebc] flex-shrink-0" />
            <p className="font-['Lato',sans-serif] text-[#023047]/55 text-sm">
              Mark the book as <strong>Finished</strong> to write a review.
            </p>
          </div>
        ) : myReview && !editMode ? (
          <>
            <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#219ebc] mb-4">
              {t("reviews.yourReview")}
            </p>
            <ReviewCard
              review={myReview}
              isOwn
              onEdit={() => setEditMode(true)}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </>
        ) : (
          <>
            <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40 mb-5">
              {myReview ? t("reviews.editReview") : t("reviews.shareThoughts")}
            </p>
            <ReviewForm
              bookId={bookId}
              bookTitle={bookTitle}
              existing={editMode ? myReview : undefined}
              onDone={() => setEditMode(false)}
            />
          </>
        )}
      </div>

      {/* Others' reviews */}
      {otherReviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="font-['Quando',serif] text-[#023047] text-lg mb-1">
            {t("reviews.noOther.title")}
          </p>
          <p className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
            {t("reviews.noOther.hint")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {otherReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Voting Section ───────────────────────────────────────────────────────────

function VotingSection() {
  const { user } = useAuth();
  const { t } = useLang();
  const [candidates, setCandidates] = useState<Book[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "books"), where("isCurrent", "==", false));
    return onSnapshot(q, (snap) =>
      setCandidates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book)))
    );
  }, []);

  useEffect(() => {
    return onSnapshot(
      collection(db, "votes"),
      (snap) => {
        const v = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote));
        setVotes(v);
        if (user) setMyVote(v.find((x) => x.userId === user.uid)?.bookId ?? null);
        setLoadingVotes(false);
      },
      (err) => { console.error("[Votes listener error]", err); setLoadingVotes(false); }
    );
  }, [user?.uid]);

  const handleVote = async (bookId: string) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      if (myVote === bookId) {
        await deleteDoc(doc(db, "votes", user.uid));
        toast.success(t("vote.removed"));
      } else {
        const now = new Date();
        await setDoc(doc(db, "votes", user.uid), {
          userId: user.uid,
          bookId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
        toast.success(myVote ? t("vote.updated") : t("vote.cast"));
      }
    } catch (err) {
      console.error("[Vote error]", err);
      toast.error(t("vote.error"));
    } finally {
      setSaving(false);
    }
  };

  if (candidates.length === 0) return null;

  const totalVotes = votes.length;

  return (
    <section id="vote" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-5">

        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-[#023047]/10" />
          <span className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40">
            {t("vote.label")}
          </span>
          <div className="h-px flex-1 bg-[#023047]/10" />
        </div>

        <div className="text-center mb-10">
          <h2 className="font-['Quando',serif] text-[#023047] text-3xl mb-2">
            {t("vote.title")}
          </h2>
          <p className="font-['Lato',sans-serif] text-[#023047]/50">
            {totalVotes > 0
              ? `${totalVotes} member${totalVotes !== 1 ? "s" : ""} ${t("vote.voted")}${myVote ? ` · ${t("vote.changeVote")}` : ""}`
              : t("vote.firstVote")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {candidates.map((book) => {
            const bookVotes = votes.filter((v) => v.bookId === book.id).length;
            const pct = totalVotes > 0 ? Math.round((bookVotes / totalVotes) * 100) : 0;
            const voted = myVote === book.id;
            const maxVotes = Math.max(...candidates.map((c) => votes.filter((v) => v.bookId === c.id).length));
            const isLeading = totalVotes > 0 && bookVotes === maxVotes && bookVotes > 0;

            return (
              <div
                key={book.id}
                className={`group rounded-2xl border-2 flex flex-col overflow-hidden transition-all duration-200 ${
                  voted
                    ? "border-[#219ebc] shadow-lg shadow-[#219ebc]/15"
                    : "border-gray-150 hover:border-[#219ebc]/40 hover:shadow-md hover:shadow-gray-100"
                }`}
              >
                {/* Cover */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-48 overflow-hidden">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center"
                    style={{ display: book.coverImage ? "none" : "flex" }}
                  >
                    <BookOpen size={40} className="text-[#219ebc]/30" />
                  </div>
                  <div className="absolute inset-0 flex items-end p-3 gap-2">
                    {voted && (
                      <span className="inline-flex items-center gap-1.5 bg-[#219ebc] text-white text-xs font-bold font-['Lato',sans-serif] px-3 py-1.5 rounded-full">
                        <Check size={11} /> Your Pick
                      </span>
                    )}
                    {isLeading && !voted && (
                      <span className="inline-flex items-center gap-1.5 bg-[#ffb703] text-[#023047] text-xs font-bold font-['Lato',sans-serif] px-3 py-1.5 rounded-full">
                        {t("picks.leading")}
                      </span>
                    )}
                    {isLeading && voted && (
                      <span className="inline-flex items-center gap-1.5 bg-[#ffb703] text-[#023047] text-xs font-bold font-['Lato',sans-serif] px-3 py-1.5 rounded-full">
                        {t("picks.leading")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-4">
                  {/* Title + author */}
                  <div className="flex-1">
                    <p className="font-['Quando',serif] text-[#023047] text-lg leading-snug mb-1">
                      {book.title}
                    </p>
                    <p className="font-['Lato',sans-serif] text-[#023047]/45 text-sm">
                      {book.author}
                    </p>
                  </div>

                  {/* Progress */}
                  {!loadingVotes && (
                    <div>
                      <div className="flex justify-between font-['Lato',sans-serif] text-xs text-[#023047]/40 mb-1.5">
                        <span>{bookVotes} {bookVotes === 1 ? "vote" : "votes"}</span>
                        <span className="font-bold text-[#023047]/60">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: voted ? "#219ebc" : "#023047",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {user && (
                    <button
                      onClick={() => handleVote(book.id)}
                      disabled={saving}
                      className={`w-full py-2.5 rounded-xl font-['Lato',sans-serif] text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 group/btn ${
                        voted
                          ? "bg-[#219ebc]/10 text-[#219ebc] hover:bg-red-50 hover:text-red-400 hover:border hover:border-red-200 focus:ring-[#219ebc]/40"
                          : "bg-[#023047] text-white hover:bg-[#034a6e] active:scale-95 focus:ring-[#023047]/30"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {voted ? (
                        <>
                          <span className="group-hover/btn:hidden">{t("vote.voted.label")} ✓</span>
                          <span className="hidden group-hover/btn:inline">{t("vote.remove")}</span>
                        </>
                      ) : t("vote.button")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── User Profile Modal ───────────────────────────────────────────────────────

function UserProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [mySuggestions, setMySuggestions] = useState<Suggestion[]>([]);
  const [suggestionSupports, setSuggestionSupports] = useState<Support[]>([]);
  const [userStats, setUserStats] = useState<{ tokenBalance: number; booksFinished: number; booksSuggested: number; supportsReceived: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const tokenBalance = userStats?.tokenBalance ?? 0;

  useEffect(() => {
    if (!user) return;
    const unsub1 = onSnapshot(
      query(collection(db, "suggestions"), where("userId", "==", user.uid)),
      (snap) => setMySuggestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Suggestion))),
      () => {}
    );
    const unsub2 = onSnapshot(
      query(collection(db, "supports"), where("suggestionOwnerId", "==", user.uid)),
      (snap) => setSuggestionSupports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Support))),
      () => {}
    );
    const unsub3 = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserStats({
          tokenBalance: d.tokenBalance ?? 0,
          booksFinished: d.booksFinished ?? 0,
          booksSuggested: d.booksSuggested ?? 0,
          supportsReceived: d.supportsReceived ?? 0,
        });
      }
    }, () => {});
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user?.uid]);

  const handleDeleteSuggestion = async (suggestion: Suggestion) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "suggestions", suggestion.id));
      toast.success(t("suggest.removed"));
    } catch {
      toast.error("Failed to delete suggestion.");
    }
  };

  if (!user) return null;

  const atLimit = mySuggestions.length >= 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-[#023047]/40 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center gap-4">
          <Avatar src={user.photoURL ?? ""} name={user.displayName ?? "?"} size={12} />
          <div className="min-w-0">
            <p className="font-['Quando',serif] text-[#023047] text-base truncate">{user.displayName}</p>
            <p className="font-['Lato',sans-serif] text-[#023047]/40 text-xs truncate">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tokens", value: tokenBalance, accent: true },
              { label: "Finished", value: userStats?.booksFinished ?? 0, accent: false },
              { label: "Suggested", value: userStats?.booksSuggested ?? 0, accent: false },
              { label: "Supports", value: userStats?.supportsReceived ?? 0, accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} className="text-center bg-gray-50 rounded-2xl py-3">
                <p className={`font-['Quando',serif] text-xl ${accent ? "text-[#219ebc]" : "text-[#023047]"}`}>{value}</p>
                <p className="font-['Lato',sans-serif] text-[10px] text-[#023047]/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Token rules */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/30 mb-3">Token rules</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: t("suggest.tokenRules.finish"), earn: true },
              { label: t("suggest.tokenRules.receive"), earn: true },
              { label: t("suggest.tokenRules.spend"), earn: false },
            ].map(({ label, earn }) => (
              <div key={label} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5">
                <span className={`font-['Lato',sans-serif] text-xs font-bold ${earn ? "text-[#219ebc]" : "text-[#023047]/40"}`}>{earn ? "+" : "−"}1</span>
                <span className="font-['Lato',sans-serif] text-xs text-[#023047]/55">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My suggestions */}
        <div className="px-6 pt-4 pb-6 space-y-3">
          <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/30">My Suggestions ({mySuggestions.length}/3)</p>

          {mySuggestions.map((s) => {
            const supportCount = suggestionSupports.filter((x) => x.suggestionId === s.id).length;
            return (
              <div key={s.id} className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  {s.coverImage ? (
                    <img src={s.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <BookOpen size={14} className="text-[#219ebc]/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Quando',serif] text-[#023047] text-sm truncate">{s.title}</p>
                  <p className="font-['Lato',sans-serif] text-[#023047]/45 text-sm">{s.author}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <ThumbsUp size={11} className="text-[#219ebc]" />
                    <span className="font-['Lato',sans-serif] text-xs text-[#023047]/50">{supportCount} {t("picks.supports")}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteSuggestion(s)} className="p-1.5 rounded-full text-[#023047]/30 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0" aria-label="Delete">
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}

          {!atLimit && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-[#219ebc]/30 rounded-2xl font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:border-[#219ebc]/50 hover:text-[#219ebc] transition-all"
            >
              + Add a suggestion ({3 - mySuggestions.length} slot{3 - mySuggestions.length !== 1 ? "s" : ""} left)
            </button>
          )}

          {showForm && (
            <SuggestionForm
              onDone={() => setShowForm(false)}
              tokenBalance={tokenBalance}
              existingCount={mySuggestions.length}
            />
          )}

          {atLimit && !showForm && (
            <p className="font-['Lato',sans-serif] text-xs text-[#023047]/40 text-center py-2">
              Maximum 3 suggestions reached.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ethos Section ────────────────────────────────────────────────────────────

const ETHOS_PRINCIPLES = [
  {
    icon: "🔍",
    title: "Immersive Exploration",
    desc: "Dive deep into the heart of each story — exploring themes, characters, and hidden meanings that reveal themselves only when read together.",
  },
  {
    icon: "🤝",
    title: "Community Connection",
    desc: "Forge meaningful bonds with fellow readers who share your passion for literature. Some of the best friendships begin with a shared book.",
  },
  {
    icon: "💡",
    title: "Inspired Insights",
    desc: "Gain fresh perspectives through engaging discussions, author interviews, and exclusive content that enrich every reading experience.",
  },
];

function EthosSection() {
  return (
    <section id="ethos" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-5">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Text side */}
          <div className="flex-1">
            <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#219ebc] mb-4">
              Our Philosophy
            </p>
            <h2 className="font-['Quando',serif] text-[#023047] text-3xl md:text-4xl leading-snug mb-4">
              Reading is better<br />together.
            </h2>
            <p className="font-['Lato',sans-serif] text-[#023047]/55 text-lg leading-relaxed mb-10">
              At The Blue Book Club, we believe every book holds more meaning when it&apos;s shared.
            </p>

            <div className="space-y-6">
              {ETHOS_PRINCIPLES.map((p) => (
                <div
                  key={p.title}
                  className="flex gap-5 p-5 rounded-2xl bg-[#f4fafb] border border-[#219ebc]/10 hover:border-[#219ebc]/25 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{p.icon}</span>
                  <div>
                    <h3 className="font-['Lato',sans-serif] font-bold text-[#023047] text-base mb-1">
                      {p.title}
                    </h3>
                    <p className="font-['Lato',sans-serif] text-[#023047]/60 text-[15px] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image side */}
          <div className="lg:w-72 flex-shrink-0 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-[#ffb703]/20 rounded-3xl translate-x-3 translate-y-3" />
              <img
                src={imgEthos}
                alt="Book club readers"
                className="relative w-60 lg:w-72 rounded-3xl shadow-xl object-cover aspect-[3/4]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works section ─────────────────────────────────────────────────────

function HowItWorksSection() {
  const { t } = useLang();

  const items = [
    { img: img1, title: t("how.discover.title"), desc: t("how.discover.desc") },
    { img: imgGirlReading, title: t("how.read.title"), desc: t("how.read.desc") },
    { img: imgSpeechBubble, title: t("how.share.title"), desc: t("how.share.desc") },
  ];

  return (
    <section id="howitworks" className="py-20 bg-[#f4fafb]">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="font-['Quando',serif] text-[#023047] text-3xl">
            {t("how.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((c, i) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-[#219ebc]/25 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#219ebc]/10 flex items-center justify-center mx-auto mb-5 font-['Quando',serif] text-[#219ebc] text-lg font-bold group-hover:bg-[#219ebc] group-hover:text-white transition-all">
                {i + 1}
              </div>
              <div className="h-28 flex items-center justify-center mb-5">
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-28 h-full object-contain"
                />
              </div>
              <h3 className="font-['Quando',serif] text-[#023047] text-xl mb-3">{c.title}</h3>
              <p className="font-['Lato',sans-serif] text-[#023047]/55 text-sm leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

function SuggestionForm({
  onDone,
  tokenBalance,
  existingCount,
}: {
  onDone: () => void;
  tokenBalance: number;
  existingCount: number;
}) {
  const { user } = useAuth();
  const { t } = useLang();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const atLimit = existingCount >= 3;
  const noTokens = tokenBalance < 1;

  const handleConfirm = async () => {
    if (!user || saving || atLimit || noTokens) return;
    setSaving(true);
    setConfirming(false);
    try {
      await addDoc(collection(db, "suggestions"), {
        userId: user.uid,
        userName: user.displayName ?? "Anonymous",
        userPhoto: user.photoURL ?? "",
        title: title.trim(),
        author: author.trim(),
        coverImage: coverImage.trim(),
        description: description.trim().slice(0, MAX_SUGGESTION_DESC),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", user.uid), {
        tokenBalance: increment(-1),
        booksSuggested: increment(1),
      });
      toast.success(`${t("suggest.added")} \u22121 Token.`);
      onDone();
    } catch {
      toast.error(t("suggest.error"));
    } finally {
      setSaving(false);
    }
  };

  if (noTokens) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <Sparkles size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="font-['Lato',sans-serif] text-sm text-amber-800">
          Not enough tokens. First, mark the Book of the Month as <strong>Finished</strong> or support another book, then come back.
        </p>
      </div>
    );
  }

  if (atLimit) {
    return (
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <BookOpen size={16} className="text-[#023047]/40 flex-shrink-0 mt-0.5" />
        <p className="font-['Lato',sans-serif] text-sm text-[#023047]/60">
          You&apos;ve reached the limit of <strong>3 active suggestions</strong>. Delete one to add a new suggestion.
        </p>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="bg-white rounded-2xl border border-[#219ebc]/20 p-6 space-y-4">
        <div className="p-4 bg-[#f4fafb] rounded-2xl border border-[#219ebc]/15">
          <p className="font-['Lato',sans-serif] text-sm font-bold text-[#023047]">{title}</p>
          <p className="font-['Lato',sans-serif] text-sm text-[#023047]/50">{author}</p>
          {description && <p className="font-['Lato',sans-serif] text-sm text-[#023047]/45 mt-1 leading-relaxed">{description}</p>}
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="font-['Lato',sans-serif] text-sm font-bold text-amber-800 mb-1">Are you sure the information is correct?</p>
          <p className="font-['Lato',sans-serif] text-xs text-amber-700">You won&apos;t be able to come back and edit this. This will cost 1 token.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="px-6 py-2.5 bg-[#219ebc] text-white rounded-full font-['Lato',sans-serif] text-sm font-bold hover:bg-[#1a8fa8] transition-all active:scale-95 disabled:opacity-40"
          >
            {saving ? t("suggest.form.saving") : "Yes, submit"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-2.5 rounded-full font-['Lato',sans-serif] text-sm text-[#023047]/50 hover:text-[#023047] hover:bg-gray-100 transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#219ebc]/20 p-6 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40">
          New suggestion
        </p>
        <span className="font-['Lato',sans-serif] text-xs text-[#023047]/40">
          {existingCount}/3 used · costs 1 token
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-['Lato',sans-serif] text-xs font-bold text-[#023047]/50 mb-1.5">
            {t("suggest.form.title")} <span className="text-red-400">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("suggest.form.titlePlaceholder")}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc]/40"
          />
        </div>
        <div>
          <label className="block font-['Lato',sans-serif] text-xs font-bold text-[#023047]/50 mb-1.5">
            {t("suggest.form.author")} <span className="text-red-400">*</span>
          </label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. F. Scott Fitzgerald"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc]/40"
          />
        </div>
      </div>
      <div>
        <label className="block font-['Lato',sans-serif] text-xs font-bold text-[#023047]/50 mb-1.5">
          {t("suggest.form.coverUrl")} <span className="font-normal">({t("reviews.optional")})</span>
        </label>
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-['Lato',sans-serif] text-sm text-[#023047] focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc]/40"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="font-['Lato',sans-serif] text-xs font-bold text-[#023047]/50">
            {t("suggest.form.why")} <span className="font-normal">({t("reviews.optional")})</span>
          </label>
          {description.length > 0 && (
            <span className={`font-['Lato',sans-serif] text-xs tabular-nums ${description.length >= MAX_SUGGESTION_DESC - 20 ? "text-red-400" : "text-[#023047]/30"}`}>
              {MAX_SUGGESTION_DESC - description.length} left
            </span>
          )}
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_SUGGESTION_DESC))}
          placeholder="A short reason why this book would make a great pick…"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 font-['Lato',sans-serif] text-sm text-[#023047] resize-none focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc]/40 placeholder:text-[#023047]/25"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (!title.trim() || !author.trim()) { toast.error(t("suggest.form.required")); return; }
            setConfirming(true);
          }}
          disabled={saving || !title.trim() || !author.trim()}
          className="px-6 py-2.5 bg-[#219ebc] text-white rounded-full font-['Lato',sans-serif] text-sm font-bold hover:bg-[#1a8fa8] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("suggest.form.submit")}
        </button>
        <button
          onClick={onDone}
          className="px-4 py-2.5 rounded-full font-['Lato',sans-serif] text-sm text-[#023047]/50 hover:text-[#023047] hover:bg-gray-100 transition-all"
        >
          {t("suggest.form.cancel")}
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  supportCount,
  isSupported,
  tokenBalance,
  isOwn,
  onSupport,
  onDelete,
}: {
  suggestion: Suggestion;
  supportCount: number;
  isSupported: boolean;
  tokenBalance: number;
  isOwn: boolean;
  onSupport: () => void;
  onDelete: () => void;
}) {
  const { t } = useLang();

  return (
    <div className={`bg-white rounded-2xl border flex gap-4 p-5 transition-all ${isOwn ? "border-[#219ebc]/25" : "border-gray-100 hover:border-gray-200"}`}>
      {/* Cover */}
      <div className="flex-shrink-0 w-14 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {suggestion.coverImage ? (
          <img
            src={suggestion.coverImage}
            alt={suggestion.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <BookOpen size={20} className="text-[#219ebc]/40" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-['Quando',serif] text-[#023047] text-base leading-snug truncate">
              {suggestion.title}
            </p>
            <p className="font-['Lato',sans-serif] text-[#023047]/45 text-sm mt-0.5">
              {suggestion.author}
            </p>
          </div>
          {isOwn && (
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={onDelete}
                aria-label="Delete suggestion"
                className="p-1.5 rounded-full text-[#023047]/30 hover:text-red-400 hover:bg-red-50 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {suggestion.description && (
          <p className="font-['Lato',sans-serif] text-[#023047]/55 text-[13px] leading-relaxed mt-2 line-clamp-2">
            {suggestion.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          {/* Suggested by */}
          <div className="flex items-center gap-1.5">
            <Avatar src={suggestion.userPhoto} name={suggestion.userName} size={5} />
            <span className="font-['Lato',sans-serif] text-[#023047]/35 text-xs">
              {isOwn ? "Your suggestion" : suggestion.userName}
            </span>
          </div>

          {/* Support area */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ThumbsUp size={13} className="text-[#219ebc]" />
              <span className="font-['Lato',sans-serif] text-sm font-bold text-[#023047]">
                {supportCount}
              </span>
            </div>
            {!isOwn && (
              <button
                onClick={onSupport}
                disabled={!isSupported && tokenBalance < 1}
                title={isSupported ? "Remove support (+1 token refund)" : tokenBalance < 1 ? "You need tokens to support" : "Support with 1 token"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-['Lato',sans-serif] text-xs font-bold transition-all ${
                  isSupported
                    ? "bg-[#219ebc]/15 text-[#219ebc] hover:bg-red-50 hover:text-red-500 active:scale-95"
                    : tokenBalance < 1
                    ? "bg-gray-100 text-[#023047]/30 cursor-not-allowed"
                    : "bg-[#ffb703]/15 text-[#023047] hover:bg-[#ffb703]/30 active:scale-95"
                }`}
              >
                <Sparkles size={11} className={isSupported ? "text-[#219ebc]" : tokenBalance < 1 ? "text-[#023047]/25" : "text-[#ffb703]"} />
                {isSupported ? "Remove" : t("picks.support")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionsSection() {
  const { user } = useAuth();
  const { t } = useLang();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [supporting, setSupporting] = useState<string | null>(null);
  const tokenBalance = useTokenBalance(user?.uid);

  useEffect(() => {
    return onSnapshot(collection(db, "suggestions"), (snap) => {
      setSuggestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Suggestion)));
    }, () => {});
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "supports"), (snap) => {
      setSupports(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Support)));
    }, () => {});
  }, []);

  const sorted = [...suggestions].sort((a, b) => {
    const aS = supports.filter((x) => x.suggestionId === a.id).length;
    const bS = supports.filter((x) => x.suggestionId === b.id).length;
    return bS - aS;
  });

  const handleDeleteSuggestion = async (suggestion: Suggestion) => {
    if (!user || suggestion.userId !== user.uid) return;
    try {
      await deleteDoc(doc(db, "suggestions", suggestion.id));
      toast.success("Suggestion deleted.");
    } catch {
      toast.error("Failed to delete suggestion.");
    }
  };

  const handleSupport = async (suggestion: Suggestion) => {
    if (!user || supporting) return;
    const existingSupport = supports.find((s) => s.suggestionId === suggestion.id && s.userId === user.uid);
    const isCurrentlySupported = !!existingSupport;
    setSupporting(suggestion.id);
    try {
      if (isCurrentlySupported) {
        await deleteDoc(doc(db, "supports", existingSupport.id));
        await updateDoc(doc(db, "users", user.uid), { tokenBalance: increment(1) });
        await updateDoc(doc(db, "users", suggestion.userId), { tokenBalance: increment(-2), supportsReceived: increment(-1) });
        toast.success("+1 Token refunded — support removed.");
      } else {
        if (tokenBalance < 1) { toast.error("Not enough tokens to support."); return; }
        await addDoc(collection(db, "supports"), {
          userId: user.uid,
          suggestionId: suggestion.id,
          suggestionOwnerId: suggestion.userId,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "users", user.uid), { tokenBalance: increment(-1) });
        await updateDoc(doc(db, "users", suggestion.userId), { tokenBalance: increment(2), supportsReceived: increment(1) });
        if (suggestion.userId !== user.uid) {
          await addDoc(collection(db, "notifications"), {
            recipientId: suggestion.userId,
            senderId: user.uid,
            senderName: user.displayName ?? "Anonymous",
            senderPhoto: user.photoURL ?? "",
            type: "support",
            suggestionId: suggestion.id,
            suggestionTitle: suggestion.title,
            read: false,
            createdAt: serverTimestamp(),
          });
        }
        toast.success(t("picks.supportToast"), { duration: 2500 });
      }
    } catch {
      toast.error(t("picks.supportError"));
    } finally {
      setSupporting(null);
    }
  };

  return (
    <section id="suggestions" className="py-16 bg-[#f4fafb]">
      <div className="max-w-4xl mx-auto px-5">

        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-[#219ebc]/20" />
          <span className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#219ebc]">
            {t("picks.label")}
          </span>
          <div className="h-px flex-1 bg-[#219ebc]/20" />
        </div>

        <div className="text-center mb-8">
          <p className="font-['Lato',sans-serif] text-[#023047]/50 text-sm">
            {t("picks.subtitle")}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl">
            <p className="font-['Quando',serif] text-[#023047] text-lg mb-1">{t("picks.empty.title")}</p>
            <p className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
              {t("picks.empty.hint")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((s) => {
              const isOwn = s.userId === user?.uid;
              const supportCount = supports.filter((x) => x.suggestionId === s.id).length;
              const isSupported = supports.some((x) => x.suggestionId === s.id && x.userId === user?.uid);
              return (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  supportCount={supportCount}
                  isSupported={isSupported}
                  tokenBalance={tokenBalance}
                  isOwn={isOwn}
                  onSupport={() => handleSupport(s)}
                  onDelete={() => handleDeleteSuggestion(s)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Reply Thread ─────────────────────────────────────────────────────────────

function ReplyThread({ review, bookTitle }: { review: Review; bookTitle: string }) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "replies"), where("reviewId", "==", review.id)),
      (snap) => {
        const r = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reply));
        r.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
        setReplies(r);
      }
    );
  }, [review.id]);

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "replies"), {
        reviewId: review.id,
        bookId: review.bookId,
        userId: user.uid,
        userName: user.displayName ?? "Anonymous",
        userPhoto: user.photoURL ?? "",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      // Notify the review owner (skip if replying to own review)
      if (review.userId !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          recipientId: review.userId,
          senderId: user.uid,
          senderName: user.displayName ?? "Anonymous",
          senderPhoto: user.photoURL ?? "",
          type: "reply",
          bookId: review.bookId,
          bookTitle,
          reviewId: review.id,
          replyText: text.trim().slice(0, 100),
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      setText("");
      setShowForm(false);
      toast.success("Reply posted.");
    } catch {
      toast.error("Couldn't post reply.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 pl-5 border-l-2 border-gray-100 space-y-3">
      {replies.map((r) => (
        <div key={r.id} className="flex gap-3 items-start">
          <Avatar src={r.userPhoto} name={r.userName} size={6} />
          <div className="flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-xs">
                {r.userName}
              </span>
              <span className="font-['Lato',sans-serif] text-[#023047]/30 text-[11px]">
                {relativeTime(r.createdAt)}
              </span>
            </div>
            <p className="font-['Lato',sans-serif] text-[#023047]/65 text-sm mt-0.5 leading-relaxed">
              {r.text}
            </p>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="flex gap-3 items-start">
          <Avatar src={user?.photoURL} name={user?.displayName} size={6} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2 font-['Lato',sans-serif] text-sm text-[#023047] resize-none focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 placeholder:text-[#023047]/25"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmit}
                disabled={saving || !text.trim()}
                className="px-4 py-1.5 bg-[#219ebc] text-white rounded-full font-['Lato',sans-serif] text-xs font-bold hover:bg-[#1a8fa8] transition-all disabled:opacity-40"
              >
                {saving ? "Posting…" : "Reply"}
              </button>
              <button
                onClick={() => { setShowForm(false); setText(""); }}
                className="px-3 py-1.5 font-['Lato',sans-serif] text-xs text-[#023047]/40 hover:text-[#023047] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-['Lato',sans-serif] text-xs text-[#219ebc] hover:underline transition-colors"
        >
          <MessageCircle size={12} />
          {replies.length > 0
            ? `${replies.length} repl${replies.length === 1 ? "y" : "ies"} · Reply`
            : "Reply"}
        </button>
      )}
    </div>
  );
}

// ─── Past Reads Page ──────────────────────────────────────────────────────────

function PastReadsPage({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [finishedBookIds, setFinishedBookIds] = useState<Set<string>>(new Set());
  const unsubRefs = useRef<Record<string, () => void>>({});

  const now = new Date();
  const cm = now.getMonth() + 1;
  const cy = now.getFullYear();

  useEffect(() => {
    return onSnapshot(collection(db, "books"), (snap) => {
      const past = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Book))
        .filter((b) => !b.isCurrent && (b.year < cy || (b.year === cy && b.month < cm)))
        .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
      setBooks(past);
      setLoading(false);
    });
  }, []);

  useEffect(() => () => { Object.values(unsubRefs.current).forEach((u) => u()); }, []);

  // Track which books the user has finished
  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, "readingStatus"), where("userId", "==", user.uid), where("status", "==", "finished")),
      (snap) => setFinishedBookIds(new Set(snap.docs.map((d) => d.data().bookId as string)))
    );
  }, [user?.uid]);

  const toggleExpand = (bookId: string) => {
    if (expandedId === bookId) { setExpandedId(null); return; }
    setExpandedId(bookId);
    if (!unsubRefs.current[bookId]) {
      const q = query(collection(db, "reviews"), where("bookId", "==", bookId));
      unsubRefs.current[bookId] = onSnapshot(q, (snap) => {
        const r = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
        r.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setReviewsMap((prev) => ({ ...prev, [bookId]: r }));
      });
    }
  };

  // Group by year-month
  const sections: { year: number; month: number; book: Book }[] = books.map((b) => ({
    year: b.year, month: b.month, book: b,
  }));

  const monthLabel = (m: number, y: number) =>
    new Date(y, m - 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Page header */}
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-10">
        <button
          onClick={onBack}
          className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors mb-8 flex items-center gap-1.5"
        >
          <span>←</span> {t("past.back")}
        </button>
        <h1 className="font-['Quando',serif] text-[#023047] text-4xl mb-3">{t("past.title")}</h1>
        <p className="font-['Lato',sans-serif] text-[#023047]/50 text-lg leading-relaxed">
          {t("past.subtitle")}
        </p>

      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Pulse className="h-5 w-36" />
                <Pulse className="h-28 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-['Quando',serif] text-[#023047]/40 text-xl mb-2">{t("past.empty.title")}</p>
            <p className="font-['Lato',sans-serif] text-[#023047]/30 text-sm">
              {t("past.empty.hint")}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map(({ year, month, book }, idx) => {
              const bookReviews = reviewsMap[book.id] ?? [];
              const avgRating = bookReviews.length > 0
                ? bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length
                : 0;
              const isExpanded = expandedId === book.id;

              return (
                <div key={book.id}>
                  {/* Month separator */}
                  {idx > 0 && <div className="h-px bg-gray-100 mb-12 -mt-0" />}
                  <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/35 mb-5">
                    {monthLabel(month, year)}
                  </p>

                  {/* Book card — muted, archived feel */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    <div className="flex gap-0">
                      {/* Cover */}
                      <div className="flex-shrink-0 w-28 bg-gray-100 flex items-center justify-center self-stretch overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={`Cover of ${book.title}`}
                            className="w-full h-full object-cover opacity-90"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <BookOpen size={28} className="text-[#023047]/20" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 px-6 py-5">
                        <h2 className="font-['Quando',serif] text-[#023047] text-xl leading-snug mb-1">
                          {book.title}
                        </h2>
                        <p className="font-['Lato',sans-serif] text-[#023047]/50 text-sm mb-3">
                          {book.author}
                        </p>

                        {book.description && (
                          <p className="font-['Lato',sans-serif] text-[#023047]/45 text-sm leading-relaxed mb-4 line-clamp-2">
                            {book.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 flex-wrap">
                          {avgRating > 0 && (
                            <div className="flex items-center gap-2">
                              <StarRating value={Math.round(avgRating)} readonly size={14} />
                              <span className="font-['Lato',sans-serif] text-[#023047]/50 text-sm">
                                {avgRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => toggleExpand(book.id)}
                            className="font-['Lato',sans-serif] text-sm text-[#219ebc] hover:underline transition-colors"
                          >
                            {isExpanded
                              ? t("past.hideReviews")
                              : bookReviews.length > 0
                              ? `${bookReviews.length} review${bookReviews.length !== 1 ? "s" : ""}`
                              : t("past.viewReviews")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded reviews + discussion */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                        {reviewsMap[book.id] === undefined ? (
                          <div className="space-y-3">
                            <ReviewSkeleton />
                          </div>
                        ) : bookReviews.length === 0 ? (
                          <p className="font-['Lato',sans-serif] text-[#023047]/35 text-sm text-center py-4">
                            {t("past.noReviews")}
                          </p>
                        ) : (
                          <div className="space-y-6">
                            {/* Discussion gate notice */}
                            {user && !finishedBookIds.has(book.id) && (
                              <div className="flex items-center gap-2 px-4 py-3 bg-[#f4fafb] rounded-xl border border-[#219ebc]/15">
                                <BookOpen size={14} className="text-[#219ebc] flex-shrink-0" />
                                <p className="font-['Lato',sans-serif] text-[#023047]/55 text-sm">
                                  Mark this book as finished to join the discussion.
                                </p>
                              </div>
                            )}
                            {bookReviews.map((r) => (
                              <div key={r.id}>
                                <ReviewCard review={r} />
                                {user && finishedBookIds.has(book.id) && (
                                  <ReplyThread review={r} bookTitle={book.title} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Closing line */}
        {!loading && sections.length > 0 && (
          <p className="font-['Quando',serif] text-[#023047]/25 text-sm italic text-center mt-20">
            {t("past.closing")}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Meetup Banner ───────────────────────────────────────────────────────────

function MeetupBanner() {
  return (
    <div className="bg-[#023047] text-white">
      <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-center gap-2 flex-wrap text-center">
        <span className="font-['Lato',sans-serif] text-sm text-white/70">📅 The meetup is automatically set to:</span>
        <span className="font-['Lato',sans-serif] text-sm font-bold text-white">Last Sunday of the month at 19:00 · École 42 Paris</span>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterSection({ onViewPast }: { onViewPast: () => void }) {
  const { t } = useLang();
  const scrollTo = (id: string) =>
    (() => { const el = document.getElementById(id); if (!el) return; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: "smooth" }); })();

  return (
    <footer id="contact" className="bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">

        {/* Brand + links */}
        <div className="mb-10">
          <p className="font-['Quando',serif] text-[#023047] text-xl mb-4">
            The Blue Book Club
          </p>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: t("footer.thisMonth"), id: "book" },
                { label: t("footer.howItWorks"), id: "howitworks" },
                { label: t("footer.suggestions"), id: "suggestions" },
              ].map(({ label, id }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors focus:outline-none"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={onViewPast}
                  className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors focus:outline-none"
                >
                  {t("footer.pastReads")}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-8" />

        {/* Concept line + meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="font-['Quando',serif] text-[#023047]/30 text-sm italic">
            {t("footer.tagline")}
          </p>
          <a
            href="https://github.com/Aria-vero-s"
            target="_blank"
            rel="noopener noreferrer"
            className="font-['Lato',sans-serif] text-[#023047]/25 text-xs hover:text-[#219ebc] transition-colors"
          >
            {t("footer.copyright")}
          </a>
        </div>

      </div>
    </footer>
  );
}


// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_BOOKS = [
  {
    id: "book-1984",
    title: "1984",
    author: "George Orwell",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
    description: "A dystopian novel about surveillance, control, and freedom in a totalitarian society.",
    month: 6,
    year: 2026,
    isCurrent: true,
  },
  {
    id: "book-brave-new-world",
    title: "Brave New World",
    author: "Aldous Huxley",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
    description: "A chilling vision of a future society built on pleasure, conformity, and the erasure of individuality.",
    month: 7,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-fahrenheit-451",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    coverImage: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
    description: "In a future where books are banned and burned, one fireman begins to question everything.",
    month: 7,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-handmaids-tale",
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780385490818-L.jpg",
    description: "A totalitarian theocracy has replaced the United States. One woman's story of resistance.",
    month: 7,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    description: "A portrait of the Jazz Age in all of its decadence and excess, told through the tragic pursuit of the American dream.",
    month: 5,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-of-mice-and-men",
    title: "Of Mice and Men",
    author: "John Steinbeck",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140177398-L.jpg",
    description: "A moving story of two men chasing their dream of owning a small farm, and the friendship that sustains them.",
    month: 4,
    year: 2026,
    isCurrent: false,
  },
];

async function seedFirestore() {
  try {
    for (const book of SEED_BOOKS) {
      const ref = doc(db, "books", book.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const { id, ...data } = book;
        await setDoc(ref, data);
      }
    }
  } catch (err) {
    // Client-side seeds are optional and usually blocked in production rules.
    console.warn("Skipping client seed:", err);
  }
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { user, loading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [view, setView] = useState<"home" | "past">("home");
  const pendingScroll = useRef<string | null>(null);

  useEffect(() => {
    if (!ENABLE_CLIENT_SEED) return;
    seedFirestore();
  }, []);

  // After returning from past view, execute any pending scroll
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
    if (view === "past") {
      pendingScroll.current = id;
      setView("home");
    } else {
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: "smooth" });
    }
  };

  const goHome = () => { setView("home"); window.scrollTo({ top: 0 }); };

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
      <Toaster position="top-center" richColors closeButton toastOptions={{ classNames: { closeButton: "!left-auto !right-2 !top-1/2 !-translate-y-1/2 !translate-x-0" } }} />
      <Navbar onProfile={() => setProfileOpen(true)} onScrollTo={scrollTo} />

      <main>
        {view === "past" ? (
          <>
            <PastReadsPage onBack={goHome} />
            <FooterSection onViewPast={() => setView("past")} />
          </>
        ) : (
          <>
            <HeroSection />
            <MeetupBanner />
            <BookOfMonth />
            <HowItWorksSection />
            <VotingSection />
            <SuggestionsSection />
            <FooterSection onViewPast={() => setView("past")} />
          </>
        )}
      </main>

      {profileOpen && user && (
        <UserProfileModal onClose={() => setProfileOpen(false)} />
      )}
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
