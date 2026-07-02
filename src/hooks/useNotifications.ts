import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppNotification } from "@/types/notification";

export function useNotifications(uid?: string): AppNotification[] {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "notifications"), where("recipientId", "==", uid)),
      (snap) => {
        const n = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
        n.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setNotifications(n);
      },
      () => { /* permission-denied expected when signed out */ }
    );
  }, [uid]);

  return notifications;
}
