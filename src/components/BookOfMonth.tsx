import { useState, useEffect } from "react";
import { BookOpen, Users, CheckCheck, MessageSquare } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { BookSkeleton } from "@/components/Skeletons";
import { StarRating } from "@/components/StarRating";
import { ReadingStatusPicker } from "@/components/ReadingStatusPicker";
import type { FirestoreBook } from "@/types/book";
import type { Review } from "@/types/review";

export function BookOfMonth() {
  const { user } = useAuth();
  const { t } = useLang();
  const [book, setBook] = useState<FirestoreBook | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusCounts, setStatusCounts] = useState({ reading: 0, finished: 0 });
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "books"), where("isCurrent", "==", true));
    return onSnapshot(
      q,
      (snap) => {
        setBook(
          snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as FirestoreBook),
        );
        setLoading(false);
      },
      () => { setLoading(false); },
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

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section id="book" className="py-16 bg-[#f4fafb]">
      <div className="max-w-4xl mx-auto px-5">
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
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
            <h2 className="font-['Quando',serif] text-[#023047] text-2xl mb-3">
              {t("book.noBook.title")}
            </h2>
            <p className="font-['Lato',sans-serif] text-[#023047]/50 max-w-sm mx-auto leading-relaxed">
              {t("book.noBook.desc")}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-0">
              {/* Cover */}
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

              {/* Info */}
              <div className="flex-1 p-7 md:p-9">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-[#ffb703]/20 text-[#a07800] font-['Lato',sans-serif] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {new Date(book.year, book.month - 1).toLocaleString("en-US", {
                      month: "long",
                    })}{" "}
                    {book.year}
                  </span>
                </div>

                <h2 className="font-['Quando',serif] text-[#023047] text-3xl md:text-4xl leading-tight mb-2">
                  {book.title}
                </h2>
                <p className="font-['Lato',sans-serif] text-[#023047]/50 text-lg mb-5">
                  by {book.author}
                </p>

                {reviews.length > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <StarRating value={Math.round(avgRating)} readonly size={16} />
                    <span className="font-['Lato',sans-serif] text-[#023047] font-bold">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">
                      ({reviews.length}{" "}
                      {reviews.length === 1 ? t("stats.review") : t("stats.reviews")})
                    </span>
                  </div>
                )}

                {book.description && (
                  <div className="mb-6">
                    <p
                      className={`font-['Lato',sans-serif] text-[#023047]/70 leading-relaxed text-[15px] ${
                        descExpanded ? "" : "line-clamp-3"
                      }`}
                    >
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
                        onClick={() =>
                          document
                            .getElementById("hero")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
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
                  <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">
                    {statusCounts.reading}
                  </span>
                  <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">
                    {t("stats.reading")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                <CheckCheck size={15} className="text-[#219ebc] flex-shrink-0" />
                <div>
                  <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">
                    {statusCounts.finished}
                  </span>
                  <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">
                    {t("stats.finished")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-4 px-4 text-center">
                <MessageSquare size={15} className="text-[#219ebc] flex-shrink-0" />
                <div>
                  <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-sm">
                    {reviews.length}
                  </span>
                  <span className="font-['Lato',sans-serif] text-[#023047]/40 text-xs ml-1">
                    {reviews.length === 1 ? t("stats.review") : t("stats.reviews")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
