import { Heart, Bookmark, Vote } from "lucide-react";
import { olCoverUrl } from "@/services/openLibrary";
import type { OLSearchDoc } from "@/types/book";

export function OLBookCard({
  book,
  userId,
  isFavorited,
  isWantToRead,
  isNominated,
  onFavorite,
  onWantToRead,
  onNominate,
}: {
  book: OLSearchDoc;
  userId?: string | null;
  isFavorited: boolean;
  isWantToRead: boolean;
  isNominated: boolean;
  onFavorite: () => void;
  onWantToRead: () => void;
  onNominate: () => void;
}) {
  const coverUrl = book.cover_i ? olCoverUrl(book.cover_i, "M") : null;
  const author = book.author_name?.[0] ?? "Unknown author";
  const year = book.first_publish_year;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#219ebc]/20 transition-all duration-200 flex flex-col group">
      {/* Cover */}
      <div className="relative h-52 bg-gradient-to-br from-[#023047] to-[#034a6e] flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="text-white/20 text-center px-3">
            <p className="font-['Quando',serif] text-sm leading-snug line-clamp-3">{book.title}</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <p className="font-['Quando',serif] text-[#023047] text-base leading-snug mb-1 line-clamp-2">
            {book.title}
          </p>
          <p className="font-['Lato',sans-serif] text-[#023047]/45 text-sm line-clamp-1">
            {author}{year ? ` · ${year}` : ""}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onFavorite}
            title={userId ? (isFavorited ? "Remove from Favorites" : "Add to Favorites") : "Sign in to use this feature"}
            disabled={!userId}
            aria-pressed={isFavorited}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-['Lato',sans-serif] text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200 ${
              isFavorited
                ? "bg-red-50 text-red-500 border-red-200"
                : "bg-white text-[#023047]/40 border-gray-200 hover:bg-red-50 hover:text-red-400 hover:border-red-200"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Heart size={12} fill={isFavorited ? "currentColor" : "none"} />
            Fave
          </button>

          <button
            onClick={onWantToRead}
            title={userId ? (isWantToRead ? "Remove from Want to Read" : "Add to Want to Read") : "Sign in to use this feature"}
            disabled={!userId}
            aria-pressed={isWantToRead}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-['Lato',sans-serif] text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ffb703]/40 ${
              isWantToRead
                ? "bg-[#ffb703]/15 text-[#a07800] border-[#ffb703]/30"
                : "bg-white text-[#023047]/40 border-gray-200 hover:bg-[#ffb703]/10 hover:text-[#a07800] hover:border-[#ffb703]/30"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Bookmark size={12} fill={isWantToRead ? "currentColor" : "none"} />
            Want
          </button>

          <button
            onClick={onNominate}
            title={userId ? (isNominated ? "Remove nomination" : "Nominate for book club") : "Sign in to use this feature"}
            disabled={!userId}
            aria-pressed={isNominated}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-['Lato',sans-serif] text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#219ebc]/40 ${
              isNominated
                ? "bg-[#219ebc]/10 text-[#219ebc] border-[#219ebc]/20"
                : "bg-white text-[#023047]/40 border-gray-200 hover:bg-[#219ebc]/8 hover:text-[#219ebc] hover:border-[#219ebc]/20"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Vote size={12} />
            Nom.
          </button>
        </div>
      </div>
    </article>
  );
}
