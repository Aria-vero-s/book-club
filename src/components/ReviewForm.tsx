import { useState } from "react";
import { toast } from "sonner";
import { collection, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { StarRating } from "@/components/StarRating";
import type { Review } from "@/types/review";

const MAX_REVIEW = 500;

export function ReviewForm({
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

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="font-['Lato',sans-serif] text-xs font-bold uppercase tracking-widest text-[#023047]/40">
            {t("reviews.thoughtsLabel")}{" "}
            <span className="normal-case tracking-normal font-normal">
              ({t("reviews.optional")})
            </span>
          </p>
          {text.length > 0 && (
            <span
              className={`font-['Lato',sans-serif] text-xs tabular-nums ${
                remaining < 50 ? "text-red-400" : "text-[#023047]/30"
              }`}
            >
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

      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving || rating === 0}
          className="px-6 py-2.5 bg-[#219ebc] text-white rounded-full font-['Lato',sans-serif] text-sm font-bold hover:bg-[#1a8fa8] hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#219ebc]/60"
          title={rating === 0 ? "Select a star rating first" : undefined}
        >
          {saving
            ? t("reviews.saving")
            : existing
            ? t("reviews.updateReview")
            : t("reviews.postReview")}
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
