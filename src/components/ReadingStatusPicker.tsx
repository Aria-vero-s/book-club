import { useState, useEffect } from "react";
import { Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { doc, setDoc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

export function ReadingStatusPicker({ bookId }: { bookId: string }) {
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
        toast.success(t("status.toast.finished"));
        await updateDoc(doc(db, "users", user.uid), { booksFinished: increment(1) });
      } else if (s === "reading" && prevStatus === "finished") {
        await updateDoc(doc(db, "users", user.uid), { booksFinished: increment(-1) });
        toast.success("Back to reading!");
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
