import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { db } from "@/lib/firebase";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import imgLanding from "@/imports/1920WLight/61f9d38cef5dfc577b507b3f35af5181e51ce63b.png";
import imgEthos from "@/imports/1920WLight/e07f166570be5a1cfe58162c1e0f069c18b250d6.png";
import img1 from "@/imports/1920WLight/02fcd00bcd724eecf83f5f9db77efaa918c241bf.png";
import img2 from "@/imports/1920WLight/153b6d915790b59ef9cc0702bfd46e0cde1d7524.png";
import img3 from "@/imports/1920WLight/a815d91c62dcdad861267e6eb3e24fed774b4510.png";

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

// ─── Utilities ────────────────────────────────────────────────────────────────

const MAX_REVIEW = 500;

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
            toast.error(`Sign-in failed: ${code || "unknown error"}`);
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
      {loading ? "Signing in…" : "Continue with Google"}
    </button>
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
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "This Month", id: "book" },
    { label: "How It Works", id: "howitworks" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-gray-100"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-5 flex items-center h-16 gap-4">
        {/* Brand */}
        <button
          onClick={() => onScrollTo("hero")}
          className="font-['Quando',serif] text-[#023047] text-lg leading-tight tracking-tight hover:text-[#219ebc] transition-colors flex-shrink-0"
          aria-label="Go to top"
        >
          The Blue<br className="md:hidden" />{" "}
          <span className="text-[#219ebc]">Book Club</span>
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex flex-1 justify-center gap-1">
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

        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <button
                onClick={onProfile}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40"
                aria-label="View your profile"
              >
                <Avatar src={user.photoURL} name={user.displayName} size={8} />
                <span className="hidden md:block font-['Lato',sans-serif] text-sm font-bold text-[#023047]">
                  {user.displayName?.split(" ")[0]}
                </span>
              </button>
              <button
                onClick={() => logOut().then(() => toast.success("You've been signed out."))}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#023047]/50 hover:text-[#023047] hover:bg-gray-100 transition-colors text-sm font-['Lato',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40"
                aria-label="Sign out"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
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
            <button
              className="block w-full text-left px-4 py-3 rounded-xl font-['Lato',sans-serif] text-red-400 hover:bg-red-50 transition-all"
              onClick={() => { setMenuOpen(false); logOut(); }}
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const { user } = useAuth();

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
          Read one book together every month.
        </p>
      </div>
    </section>
  );
}

// ─── Reading Status Picker ────────────────────────────────────────────────────

function ReadingStatusPicker({ bookId }: { bookId: string }) {
  const { user } = useAuth();
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
    try {
      await setDoc(doc(db, "readingStatus", `${user.uid}_${bookId}`), {
        userId: user.uid,
        bookId,
        status: s,
      });
      toast.success(s === "reading" ? "Marked as reading." : "Marked as finished.");
    } catch {
      toast.error("Couldn't update status. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40 mb-3">
        My Status
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
          Reading
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
          Finished
        </button>
      </div>
    </div>
  );
}

// ─── Book of the Month ────────────────────────────────────────────────────────

function BookOfMonth() {
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusCounts, setStatusCounts] = useState({ reading: 0, finished: 0 });
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "books"), where("isCurrent", "==", true));
    return onSnapshot(q, (snap) => {
      setBook(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Book));
      setLoading(false);
    });
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
            Book of the Month
          </span>
          <div className="h-px flex-1 bg-[#219ebc]/20" />
        </div>

        {loading ? (
          <BookSkeleton />
        ) : !book ? (
          /* Empty state */
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <h2 className="font-['Quando',serif] text-[#023047] text-2xl mb-3">
              Next Book Coming Soon
            </h2>
            <p className="font-['Lato',sans-serif] text-[#023047]/50 max-w-sm mx-auto leading-relaxed">
              The community is selecting this month&apos;s book. Voting opens shortly.
            </p>
            <p className="font-['Lato',sans-serif] text-[#023047]/35 text-sm max-w-xs mx-auto mt-3">
              Be ready to join the discussion as soon as it&apos;s announced.
            </p>
          </div>
        ) : (
          <>
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
                        ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
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
                          {descExpanded ? "Show less" : "Read more"}
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
                          Sign in
                        </button>{" "}
                        to track your progress and join the discussion.
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
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">reading</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                  <CheckCheck size={15} className="text-[#219ebc] flex-shrink-0" />
                  <div>
                    <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">{statusCounts.finished}</span>
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">finished</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                  <MessageSquare size={15} className="text-[#219ebc] flex-shrink-0" />
                  <div>
                    <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">{reviews.length}</span>
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">{reviews.length === 1 ? "review" : "reviews"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {user && (
              <ReviewSection bookId={book.id} bookTitle={book.title} reviews={reviews} />
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
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? "");
  const [saving, setSaving] = useState(false);
  const remaining = MAX_REVIEW - text.length;

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error("Please select a star rating before posting.");
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateDoc(doc(db, "reviews", existing.id), { rating, text });
        toast.success("Review updated!");
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
        toast.success("Review posted.");
      }
      onDone();
    } catch {
      toast.error("Couldn't save your review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Star picker */}
      <div>
        <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40 mb-3">
          How would you rate it?
        </p>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size={30} />
          {rating > 0 && (
            <span className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
              {["", "Poor", "Fair", "Good", "Great", "Amazing"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40">
            Your thoughts <span className="normal-case tracking-normal font-normal">(optional)</span>
          </p>
          {text.length > 0 && (
            <span className={`font-['Lato',sans-serif] text-xs tabular-nums ${remaining < 50 ? "text-red-400" : "text-[#023047]/30"}`}>
              {remaining} left
            </span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_REVIEW))}
          placeholder={`What did you think about ${bookTitle}?`}
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
          {saving ? "Saving…" : existing ? "Update Review" : "Post Review"}
        </button>
        {(existing || text) && (
          <button
            onClick={onDone}
            className="px-5 py-2.5 rounded-full font-['Lato',sans-serif] text-sm text-[#023047]/50 hover:text-[#023047] hover:bg-gray-100 transition-all"
          >
            Cancel
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
}: {
  bookId: string;
  bookTitle: string;
  reviews: Review[];
}) {
  const { user } = useAuth();
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
          Community Reviews
          {reviews.length > 0 && (
            <span className="ml-2 font-['Lato',sans-serif] font-normal text-base text-[#023047]/40">
              ({reviews.length})
            </span>
          )}
        </h3>
      </div>

      {/* My review / form */}
      <div className="bg-white rounded-2xl border border-[#219ebc]/20 p-6">
        {myReview && !editMode ? (
          <>
            <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#219ebc] mb-4">
              Your Review
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
              {myReview ? "Edit Your Review" : "Share Your Thoughts"}
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
            No other reviews yet
          </p>
          <p className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
            Your review appears in the section above. Other members&apos; reviews will show here.
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
    return onSnapshot(collection(db, "votes"), (snap) => {
      const v = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote));
      setVotes(v);
      if (user) setMyVote(v.find((x) => x.userId === user.uid)?.bookId ?? null);
      setLoadingVotes(false);
    });
  }, [user?.uid]);

  const handleVote = async (bookId: string) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      if (myVote === bookId) {
        await deleteDoc(doc(db, "votes", user.uid));
        toast.success("Vote removed.");
      } else {
        const now = new Date();
        await setDoc(doc(db, "votes", user.uid), {
          userId: user.uid,
          bookId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
        toast.success(myVote ? "Vote updated." : "Vote cast.");
      }
    } catch {
      toast.error("Couldn't save vote. Please try again.");
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
            Vote for Next Month
          </span>
          <div className="h-px flex-1 bg-[#023047]/10" />
        </div>

        <div className="text-center mb-10">
          <h2 className="font-['Quando',serif] text-[#023047] text-3xl mb-2">
            What should we read next?
          </h2>
          <p className="font-['Lato',sans-serif] text-[#023047]/50">
            {totalVotes > 0
              ? `${totalVotes} member${totalVotes !== 1 ? "s" : ""} have voted${myVote ? " · You can change your vote anytime" : ""}`
              : "Be the first to vote!"}
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
                        Leading
                      </span>
                    )}
                    {isLeading && voted && (
                      <span className="inline-flex items-center gap-1.5 bg-[#ffb703] text-[#023047] text-xs font-bold font-['Lato',sans-serif] px-3 py-1.5 rounded-full">
                        Leading
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
                          <span className="group-hover/btn:hidden">Voted ✓</span>
                          <span className="hidden group-hover/btn:inline">Remove vote</span>
                        </>
                      ) : "Vote for this book"}
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
  const { user, logOut } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myStatus, setMyStatus] = useState<ReadingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub1 = onSnapshot(
      query(collection(db, "reviews"), where("userId", "==", user.uid)),
      (snap) => { setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review))); setLoading(false); }
    );
    const unsub2 = onSnapshot(
      query(collection(db, "readingStatus"), where("userId", "==", user.uid)),
      (snap) => setMyStatus(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as ReadingStatus))
    );
    return () => { unsub1(); unsub2(); };
  }, [user?.uid]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Your profile"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Teal header */}
        <div className="bg-gradient-to-br from-[#219ebc] to-[#1a8aa6] px-6 pt-8 pb-8 relative text-center">
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X size={16} />
          </button>

          {/* Avatar with upload overlay */}
          <div className="relative inline-block">
            <Avatar src={user.photoURL} name={user.displayName} size={20} />
            <label
              htmlFor="profile-photo-upload"
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-50 transition-colors"
              title="Change profile picture"
            >
              <Edit2 size={12} className="text-[#219ebc]" />
            </label>
            <input
              id="profile-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result as string;
                  // Update Firestore user doc with new photo
                  setDoc(doc(db, "users", user.uid), { photoURL: dataUrl }, { merge: true })
                    .then(() => toast.success("Profile picture updated."))
                    .catch(() => toast.error("Failed to update picture."));
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>

          <h2 className="font-['Quando',serif] text-white text-2xl mt-4 mb-1">
            {user.displayName}
          </h2>
          <p className="font-['Lato',sans-serif] text-white/70 text-sm">{user.email}</p>
        </div>

        {/* Stats card (overlapping header) */}
        <div className="px-6 pt-6 pb-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {[
              { value: reviews.length.toString(), label: "Reviews" },
              { value: avgRating ?? "—", label: "Avg. Stars" },
              { value: myStatus?.status === "reading" ? "Reading" : myStatus?.status === "finished" ? "Finished" : "—", label: "Status" },
            ].map(({ value, label }) => (
              <div key={label} className="py-5 text-center bg-white">
                <p className="font-['Quando',serif] text-[#023047] text-xl leading-none">{value}</p>
                <p className="font-['Lato',sans-serif] text-[#023047]/40 text-xs mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Review list */}
        {loading ? (
          <div className="px-6 pb-6 space-y-3">
            <ReviewSkeleton />
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-6 pb-8 text-center">
            <p className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
              No reviews yet.
            </p>
          </div>
        ) : (
          <div className="px-6 pb-2 max-h-52 overflow-y-auto space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                <StarRating value={r.rating} readonly size={14} />
                {r.text && (
                  <p className="font-['Lato',sans-serif] text-[#023047]/60 text-sm line-clamp-2 flex-1">
                    {r.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sign out */}
        <div className="px-6 pt-3 pb-6">
          <button
            onClick={() => { logOut(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-['Lato',sans-serif] text-sm text-[#023047]/50 hover:text-[#023047] hover:bg-gray-50 transition-all border border-gray-100"
          >
            <LogOut size={14} />
            Sign out
          </button>
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

const HOW_IT_WORKS = [
  { img: img1, title: "Discover", desc: "See the Book of the Month and decide if you want to join." },
  { img: img2, title: "Read", desc: "Track your progress as you read at your own pace." },
  { img: img3, title: "Share", desc: "Leave a rating, write a review, and see what others think before voting for the next book." },
];

function HowItWorksSection() {
  return (
    <section id="howitworks" className="py-20 bg-[#f4fafb]">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="font-['Quando',serif] text-[#023047] text-3xl">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((c, i) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-[#219ebc]/25 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#219ebc]/10 flex items-center justify-center mx-auto mb-5 font-['Quando',serif] text-[#219ebc] text-lg font-bold group-hover:bg-[#219ebc] group-hover:text-white transition-all">
                {i + 1}
              </div>
              <img
                src={c.img}
                alt={c.title}
                className="w-28 mx-auto object-contain mb-5"
              />
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

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterSection() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="contact" className="bg-[#023047]">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-10">

        {/* Main row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12">

          {/* Brand */}
          <div className="max-w-xs">
            <p className="font-['Quando',serif] text-white text-xl mb-3">
              The Blue Book Club
            </p>
            <p className="font-['Lato',sans-serif] text-white/50 text-sm leading-relaxed">
              A monthly reading community built around one shared book.
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3">
              {[
                { label: "This Month", id: "book" },
                { label: "How It Works", id: "howitworks" },
              ].map(({ label, id }) => (
                <li key={id}>
                  <button
                    onClick={() => scrollTo(id)}
                    className="font-['Lato',sans-serif] text-sm text-white/40 hover:text-white transition-colors focus:outline-none"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['Lato',sans-serif] text-sm text-white/40 hover:text-white transition-colors focus:outline-none"
                >
                  Source Code
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Concept line + meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="font-['Quando',serif] text-white/30 text-sm italic">
            One book. One month. One community.
          </p>
          <div className="flex flex-col md:items-end gap-1">
            <p className="font-['Lato',sans-serif] text-white/20 text-xs">
              Built with React · Firebase · TypeScript
            </p>
            <p className="font-['Lato',sans-serif] text-white/20 text-xs">
              © 2026 The Blue Book Club
            </p>
          </div>
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
];

async function seedFirestore() {
  for (const book of SEED_BOOKS) {
    const ref = doc(db, "books", book.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const { id, ...data } = book;
      await setDoc(ref, data);
    }
  }
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { user, loading } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { seedFirestore(); }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

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
      <Toaster position="top-center" richColors closeButton />
      <Navbar onProfile={() => setProfileOpen(true)} onScrollTo={scrollTo} />

      <main>
        <HeroSection />
        <BookOfMonth />
        <HowItWorksSection />
        <VotingSection />
        <FooterSection />
      </main>

      {profileOpen && user && (
        <UserProfileModal onClose={() => setProfileOpen(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
