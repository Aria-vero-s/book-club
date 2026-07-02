import { useState, useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Pulse, ReviewSkeleton } from "@/components/Skeletons";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";
import { ReplyThread } from "@/components/ReplyThread";
import type { FirestoreBook } from "@/types/book";
import type { Review } from "@/types/review";

export function PastReadsPage({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [books, setBooks] = useState<FirestoreBook[]>([]);
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
        .map((d) => ({ id: d.id, ...d.data() } as FirestoreBook))
        .filter((b) => !b.isCurrent && (b.year < cy || (b.year === cy && b.month < cm)))
        .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));
      setBooks(past);
      setLoading(false);
    });
  }, []);

  useEffect(() => () => { Object.values(unsubRefs.current).forEach((u) => u()); }, []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(
        collection(db, "readingStatus"),
        where("userId", "==", user.uid),
        where("status", "==", "finished"),
      ),
      (snap) => setFinishedBookIds(new Set(snap.docs.map((d) => d.data().bookId as string))),
    );
  }, [user?.uid]);

  const toggleExpand = (bookId: string) => {
    if (expandedId === bookId) {
      setExpandedId(null);
      return;
    }
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

  const monthLabel = (m: number, y: number) =>
    new Date(y, m - 1).toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white pt-16">
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
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-['Quando',serif] text-[#023047]/40 text-xl mb-2">
              {t("past.empty.title")}
            </p>
            <p className="font-['Lato',sans-serif] text-[#023047]/30 text-sm">
              {t("past.empty.hint")}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {books.map((book, idx) => {
              const bookReviews = reviewsMap[book.id] ?? [];
              const avgRating =
                bookReviews.length > 0
                  ? bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length
                  : 0;
              const isExpanded = expandedId === book.id;

              return (
                <div key={book.id}>
                  {idx > 0 && <div className="h-px bg-gray-100 mb-12" />}
                  <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/35 mb-5">
                    {monthLabel(book.month, book.year)}
                  </p>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                    <div className="flex">
                      <div className="flex-shrink-0 w-28 bg-gray-100 flex items-center justify-center self-stretch overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={`Cover of ${book.title}`}
                            className="w-full h-full object-cover opacity-90"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <BookOpen size={28} className="text-[#023047]/20" />
                        )}
                      </div>

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

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                        {reviewsMap[book.id] === undefined ? (
                          <ReviewSkeleton />
                        ) : bookReviews.length === 0 ? (
                          <p className="font-['Lato',sans-serif] text-[#023047]/35 text-sm text-center py-4">
                            {t("past.noReviews")}
                          </p>
                        ) : (
                          <div className="space-y-6">
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

        {!loading && books.length > 0 && (
          <p className="font-['Quando',serif] text-[#023047]/25 text-sm italic text-center mt-20">
            {t("past.closing")}
          </p>
        )}
      </div>
    </div>
  );
}
