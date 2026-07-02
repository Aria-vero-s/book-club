import { useState, useEffect } from "react";
import { BookOpen, Check } from "lucide-react";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { FirestoreBook } from "@/types/book";
import type { Vote } from "@/types/vote";

export function VotingSection() {
  const { user } = useAuth();
  const { t } = useLang();
  const [candidates, setCandidates] = useState<FirestoreBook[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "books"), where("isCurrent", "==", false));
    return onSnapshot(q, (snap) =>
      setCandidates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBook))),
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
      () => { setLoadingVotes(false); },
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
    } catch {
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
            const maxVotes = Math.max(
              ...candidates.map((c) => votes.filter((v) => v.bookId === c.id).length),
            );
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
                        const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                        next?.style.setProperty("display", "flex");
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
                    {isLeading && (
                      <span className="inline-flex items-center gap-1.5 bg-[#ffb703] text-[#023047] text-xs font-bold font-['Lato',sans-serif] px-3 py-1.5 rounded-full">
                        {t("picks.leading")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex-1">
                    <p className="font-['Quando',serif] text-[#023047] text-lg leading-snug mb-1">
                      {book.title}
                    </p>
                    <p className="font-['Lato',sans-serif] text-[#023047]/45 text-sm">
                      {book.author}
                    </p>
                  </div>

                  {!loadingVotes && (
                    <div>
                      <div className="flex justify-between font-['Lato',sans-serif] text-xs text-[#023047]/40 mb-1.5">
                        <span>
                          {bookVotes} {bookVotes === 1 ? "vote" : "votes"}
                        </span>
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
                      ) : (
                        t("vote.button")
                      )}
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
