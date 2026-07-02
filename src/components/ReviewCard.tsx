import { Edit2, Trash2 } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { Avatar } from "@/components/Avatar";
import { relativeTime } from "@/lib/time";
import type { Review } from "@/types/review";

export function ReviewCard({
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
                <span className="text-xs text-[#023047]/30 font-['Lato',sans-serif]">{time}</span>
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
