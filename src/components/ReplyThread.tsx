import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { relativeTime } from "@/lib/time";
import { Avatar } from "@/components/Avatar";
import type { Review, Reply } from "@/types/review";

export function ReplyThread({ review, bookTitle }: { review: Review; bookTitle: string }) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "replies"), where("reviewId", "==", review.id)),
      (snap) => {
        const r = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reply));
        r.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
        setReplies(r);
      },
    );
  }, [review.id]);

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "replies"), {
        reviewId: review.id,
        bookId: review.bookId,
        userId: user.uid,
        userName: user.displayName ?? "Anonymous",
        userPhoto: user.photoURL ?? "",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      if (review.userId !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          recipientId: review.userId,
          senderId: user.uid,
          senderName: user.displayName ?? "Anonymous",
          senderPhoto: user.photoURL ?? "",
          type: "reply",
          bookId: review.bookId,
          bookTitle,
          reviewId: review.id,
          replyText: text.trim().slice(0, 100),
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      setText("");
      setShowForm(false);
      toast.success("Reply posted.");
    } catch {
      toast.error("Couldn't post reply.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 pl-5 border-l-2 border-gray-100 space-y-3">
      {replies.map((r) => (
        <div key={r.id} className="flex gap-3 items-start">
          <Avatar src={r.userPhoto} name={r.userName} size={6} />
          <div className="flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-['Lato',sans-serif] font-bold text-[#023047] text-xs">
                {r.userName}
              </span>
              <span className="font-['Lato',sans-serif] text-[#023047]/30 text-[11px]">
                {relativeTime(r.createdAt)}
              </span>
            </div>
            <p className="font-['Lato',sans-serif] text-[#023047]/65 text-sm mt-0.5 leading-relaxed">
              {r.text}
            </p>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="flex gap-3 items-start">
          <Avatar src={user?.photoURL} name={user?.displayName} size={6} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a reply…"
              rows={2}
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2 font-['Lato',sans-serif] text-sm text-[#023047] resize-none focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 placeholder:text-[#023047]/25"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmit}
                disabled={saving || !text.trim()}
                className="px-4 py-1.5 bg-[#219ebc] text-white rounded-full font-['Lato',sans-serif] text-xs font-bold hover:bg-[#1a8fa8] transition-all disabled:opacity-40"
              >
                {saving ? "Posting…" : "Reply"}
              </button>
              <button
                onClick={() => { setShowForm(false); setText(""); }}
                className="px-3 py-1.5 font-['Lato',sans-serif] text-xs text-[#023047]/40 hover:text-[#023047] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 font-['Lato',sans-serif] text-xs text-[#219ebc] hover:underline transition-colors"
        >
          <MessageCircle size={12} />
          {replies.length > 0
            ? `${replies.length} repl${replies.length === 1 ? "y" : "ies"} · Reply`
            : "Reply"}
        </button>
      )}
    </div>
  );
}
