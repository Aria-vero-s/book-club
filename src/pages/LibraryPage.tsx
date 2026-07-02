import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookActions } from "@/hooks/useBookActions";
import { searchBooks, searchByAuthor } from "@/services/openLibrary";
import { OLBookCard } from "@/components/OLBookCard";
import type { OLSearchDoc } from "@/types/book";

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 300;

export function LibraryPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { isFavorited, isWantToRead, isNominated, toggleFavorite, toggleWantToRead, nominate } =
    useBookActions(user?.uid);

  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"title" | "author">("title");
  const [results, setResults] = useState<OLSearchDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string, mode: "title" | "author", pg: number, append: boolean) => {
      if (!q.trim()) {
        setResults([]);
        setTotal(0);
        setSearched(false);
        return;
      }
      if (pg === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res =
          mode === "author"
            ? await searchByAuthor(q, pg, PAGE_SIZE)
            : await searchBooks(q, pg, PAGE_SIZE);
        setResults((prev) => (append ? [...prev, ...res.docs] : res.docs));
        setTotal(res.numFound);
        setSearched(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, searchMode, 1, false);
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchMode]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, searchMode, nextPage, true);
  };

  const hasMore = results.length < total;

  const bookKey = (doc: OLSearchDoc) => doc.key ?? `${doc.title}-${doc.author_name?.[0]}`;

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <button
          onClick={onBack}
          className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors mb-8 flex items-center gap-1.5"
        >
          <span>←</span> Back
        </button>

        <h1 className="font-['Quando',serif] text-[#023047] text-4xl mb-3">Library</h1>
        <p className="font-['Lato',sans-serif] text-[#023047]/50 text-lg leading-relaxed mb-8">
          Search millions of books. Favorite, save, or nominate one for the next club read.
        </p>

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#023047]/30 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchMode === "author" ? "Search by author name…" : "Search by title…"
              }
              className="w-full pl-10 pr-10 py-3.5 rounded-2xl border border-gray-200 font-['Lato',sans-serif] text-[#023047] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc]/40 placeholder:text-[#023047]/25 transition-all"
              aria-label="Search books"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#023047]/30 hover:text-[#023047] transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex rounded-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setSearchMode("title")}
              aria-pressed={searchMode === "title"}
              className={`px-4 py-3 font-['Lato',sans-serif] text-sm font-bold transition-colors ${
                searchMode === "title"
                  ? "bg-[#219ebc] text-white"
                  : "bg-white text-[#023047]/50 hover:bg-gray-50"
              }`}
            >
              Title
            </button>
            <button
              onClick={() => setSearchMode("author")}
              aria-pressed={searchMode === "author"}
              className={`px-4 py-3 font-['Lato',sans-serif] text-sm font-bold transition-colors ${
                searchMode === "author"
                  ? "bg-[#219ebc] text-white"
                  : "bg-white text-[#023047]/50 hover:bg-gray-50"
              }`}
            >
              Author
            </button>
          </div>
        </div>

        {/* Auth nudge for non-signed-in users */}
        {!user && (
          <div className="mb-6 px-4 py-3 bg-[#f4fafb] rounded-2xl border border-[#219ebc]/15 font-['Lato',sans-serif] text-sm text-[#023047]/55">
            Sign in to save favorites, build your reading list, and nominate books for the club.
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="animate-spin text-[#219ebc]" />
            <span className="font-['Lato',sans-serif] text-[#023047]/40 text-sm">Searching…</span>
          </div>
        ) : !searched ? (
          <div className="text-center py-20">
            <Search size={36} className="mx-auto text-[#023047]/15 mb-4" />
            <p className="font-['Quando',serif] text-[#023047]/35 text-xl">Start typing to search</p>
            <p className="font-['Lato',sans-serif] text-[#023047]/25 text-sm mt-1">
              Powered by Open Library
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-['Quando',serif] text-[#023047]/40 text-xl mb-2">No results found</p>
            <p className="font-['Lato',sans-serif] text-[#023047]/30 text-sm">
              Try a different title or author name
            </p>
          </div>
        ) : (
          <>
            <p className="font-['Lato',sans-serif] text-xs text-[#023047]/35 mb-5">
              {total.toLocaleString()} result{total !== 1 ? "s" : ""} · showing {results.length}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {results.map((book) => (
                <OLBookCard
                  key={bookKey(book)}
                  book={book}
                  userId={user?.uid}
                  isFavorited={isFavorited(bookKey(book))}
                  isWantToRead={isWantToRead(bookKey(book))}
                  isNominated={isNominated(bookKey(book))}
                  onFavorite={() => toggleFavorite(book)}
                  onWantToRead={() => toggleWantToRead(book)}
                  onNominate={() => nominate(book)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 border-2 border-gray-200 rounded-full font-['Lato',sans-serif] text-sm font-bold text-[#023047]/60 hover:border-[#219ebc] hover:text-[#219ebc] hover:bg-[#219ebc]/5 transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                  {loadingMore ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
