import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import type { Favorite, WantToRead, Nomination } from "@/types/book";

type BookArg = { key: string; title: string; author: string; coverI?: number };

/** Sanitises an OL book key for use as a Firestore document-ID segment */
function sanitiseKey(key: string) {
  return key.replace(/\//g, "_");
}

export function useBookActions(userId?: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [wantToRead, setWantToRead] = useState<WantToRead[]>([]);
  const [nomination, setNomination] = useState<Nomination | null>(null);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setWantToRead([]);
      setNomination(null);
      return;
    }

    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;

    const unsubFav = onSnapshot(
      query(collection(db, "favorites"), where("userId", "==", userId)),
      (snap) => setFavorites(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Favorite))),
      () => {}
    );

    const unsubWtr = onSnapshot(
      query(collection(db, "wantToRead"), where("userId", "==", userId)),
      (snap) => setWantToRead(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WantToRead))),
      () => {}
    );

    const unsubNom = onSnapshot(
      query(
        collection(db, "nominations"),
        where("userId", "==", userId),
        where("year", "==", cy),
        where("month", "==", cm),
      ),
      (snap) =>
        setNomination(
          snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Nomination),
        ),
      () => {}
    );

    return () => { unsubFav(); unsubWtr(); unsubNom(); };
  }, [userId]);

  const toggleFavorite = async (book: BookArg) => {
    if (!userId) return;
    const ref = doc(db, "favorites", `${userId}_${sanitiseKey(book.key)}`);
    const existing = favorites.find((f) => f.bookKey === book.key);
    try {
      if (existing) {
        await deleteDoc(ref);
        toast.success("Removed from favorites");
      } else {
        await setDoc(ref, {
          userId,
          bookKey: book.key,
          bookTitle: book.title,
          bookAuthor: book.author,
          coverI: book.coverI ?? null,
          addedAt: serverTimestamp(),
        });
        toast.success("Added to favorites ❤️");
      }
    } catch {
      toast.error("Action failed. Try again.");
    }
  };

  const toggleWantToRead = async (book: BookArg) => {
    if (!userId) return;
    const ref = doc(db, "wantToRead", `${userId}_${sanitiseKey(book.key)}`);
    const existing = wantToRead.find((w) => w.bookKey === book.key);
    try {
      if (existing) {
        await deleteDoc(ref);
        toast.success("Removed from Want to Read");
      } else {
        await setDoc(ref, {
          userId,
          bookKey: book.key,
          bookTitle: book.title,
          bookAuthor: book.author,
          coverI: book.coverI ?? null,
          addedAt: serverTimestamp(),
        });
        toast.success("Added to Want to Read ⭐");
      }
    } catch {
      toast.error("Action failed. Try again.");
    }
  };

  const nominate = async (book: BookArg) => {
    if (!userId) return;
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;
    const ref = doc(db, "nominations", `${userId}_${cy}_${cm}`);
    try {
      if (nomination?.bookKey === book.key) {
        await deleteDoc(ref);
        toast.success("Nomination removed");
      } else {
        await setDoc(ref, {
          userId,
          bookKey: book.key,
          bookTitle: book.title,
          bookAuthor: book.author,
          coverI: book.coverI ?? null,
          year: cy,
          month: cm,
          nominatedAt: serverTimestamp(),
        });
        toast.success(nomination ? "Nomination updated 🗳" : "Book nominated! 🗳");
      }
    } catch {
      toast.error("Action failed. Try again.");
    }
  };

  return {
    favorites,
    wantToRead,
    nomination,
    toggleFavorite,
    toggleWantToRead,
    nominate,
    isFavorited: (key: string) => favorites.some((f) => f.bookKey === key),
    isWantToRead: (key: string) => wantToRead.some((w) => w.bookKey === key),
    isNominated: (key: string) => nomination?.bookKey === key,
  };
}
