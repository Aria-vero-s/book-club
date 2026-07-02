import { useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import type { Review } from "@/types/review";

export function ReviewSection({
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
