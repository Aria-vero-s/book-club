import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNotifications } from "@/hooks/useNotifications";
import { relativeTime } from "@/lib/time";
import { Avatar } from "@/components/Avatar";

export function NotificationBell({ uid }: { uid: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifications = useNotifications(uid);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const markRead = (id: string) => updateDoc(doc(db, "notifications", id), { read: true });
  const dismiss = (id: string) => deleteDoc(doc(db, "notifications", id));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-2 rounded-full hover:bg-gray-100 text-[#023047]/50 hover:text-[#023047] transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#219ebc] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 w-80 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-['Quando',serif] text-[#023047] text-sm">Notifications</p>
            {unread > 0 && (
              <span className="font-['Lato',sans-serif] text-xs text-[#023047]/40">{unread} unread</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="font-['Lato',sans-serif] text-[#023047]/35 text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => {
                // Only render "reply" type; skip legacy "support" notifications silently
                if (n.type !== "reply") return null;
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 items-start transition-colors ${
                      !n.read ? "bg-[#f4fafb]" : "bg-white"
                    }`}
                  >
                    <Avatar src={n.senderPhoto} name={n.senderName} size={8} />
                    <div className="flex-1 min-w-0">
                      <p className="font-['Lato',sans-serif] text-xs text-[#023047]/70 leading-relaxed">
                        <span className="font-bold text-[#023047]">{n.senderName}</span>
                        {" replied to your review of "}
                        <span className="font-bold text-[#023047]">{n.bookTitle}</span>
                      </p>
                      {n.replyText && (
                        <p className="font-['Lato',sans-serif] text-xs text-[#023047]/40 mt-0.5 line-clamp-1 italic">
                          &ldquo;{n.replyText}&rdquo;
                        </p>
                      )}
                      <p className="font-['Lato',sans-serif] text-[10px] text-[#023047]/30 mt-1">
                        {relativeTime(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          aria-label="Mark as read"
                          className="p-1.5 rounded-full hover:bg-[#219ebc]/10 text-[#219ebc] transition-colors"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => dismiss(n.id)}
                        aria-label="Dismiss notification"
                        className="p-1.5 rounded-full hover:bg-red-50 text-[#023047]/25 hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
