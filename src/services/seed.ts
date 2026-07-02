import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const SEED_BOOKS = [
  {
    id: "book-1984",
    title: "1984",
    author: "George Orwell",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
    description: "A dystopian novel about surveillance, control, and freedom in a totalitarian society.",
    month: 6,
    year: 2026,
    isCurrent: true,
  },
  {
    id: "book-brave-new-world",
    title: "Brave New World",
    author: "Aldous Huxley",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
    description: "A chilling vision of a future society built on pleasure, conformity, and the erasure of individuality.",
    month: 7,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-fahrenheit-451",
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    coverImage: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
    description: "In a future where books are banned and burned, one fireman begins to question everything.",
    month: 7,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-handmaids-tale",
    title: "The Handmaid's Tale",
    author: "Margaret Atwood",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780385490818-L.jpg",
    description: "A totalitarian theocracy has replaced the United States. One woman's story of resistance.",
    month: 7,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    description: "A portrait of the Jazz Age in all of its decadence and excess, told through the tragic pursuit of the American dream.",
    month: 5,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-of-mice-and-men",
    title: "Of Mice and Men",
    author: "John Steinbeck",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780140177398-L.jpg",
    description: "A moving story of two men chasing their dream of owning a small farm, and the friendship that sustains them.",
    month: 4,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-kill-mockingbird",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg",
    description: "A profound story of racial injustice and the loss of innocence in the Deep South, seen through the eyes of young Scout Finch.",
    month: 3,
    year: 2026,
    isCurrent: false,
  },
  {
    id: "book-catcher-rye",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg",
    description: "The story of Holden Caulfield, a teenage boy navigating alienation, identity, and the phoniness of adult society.",
    month: 2,
    year: 2026,
    isCurrent: false,
  },
];

const SEED_REVIEWS = [
  {
    id: "seed-review-gatsby-emma",
    bookId: "book-great-gatsby",
    userId: "seed-user-emma",
    userName: "Emma Laurent",
    userPhoto: "",
    rating: 5,
    text: "A masterpiece of American literature. Fitzgerald captures the glittering emptiness of the Roaring Twenties with such precision. Gatsby\u2019s longing is heartbreaking.",
    createdAt: Timestamp.fromDate(new Date(2026, 5, 5)),
  },
  {
    id: "seed-review-gatsby-marc",
    bookId: "book-great-gatsby",
    userId: "seed-user-marc",
    userName: "Marc Duval",
    userPhoto: "",
    rating: 4,
    text: "Beautiful prose, though I found Gatsby himself somewhat distant. The party scenes are vivid but I felt more for Nick than any other character.",
    createdAt: Timestamp.fromDate(new Date(2026, 5, 6)),
  },
];

const SEED_REPLIES = [
  {
    id: "seed-reply-gatsby-1",
    reviewId: "seed-review-gatsby-emma",
    bookId: "book-great-gatsby",
    userId: "seed-user-marc",
    userName: "Marc Duval",
    userPhoto: "",
    text: "Absolutely \u2014 the green light imagery alone is worth the read. Did anyone else feel the meetup discussion made the ending land differently?",
    createdAt: Timestamp.fromDate(new Date(2026, 5, 7)),
  },
  {
    id: "seed-reply-gatsby-2",
    reviewId: "seed-review-gatsby-emma",
    bookId: "book-great-gatsby",
    userId: "seed-user-sofia",
    userName: "Sofia Reyes",
    userPhoto: "",
    text: "Yes! I kept thinking about the valley of ashes as a metaphor for what Gatsby\u2019s dream actually cost him.",
    createdAt: Timestamp.fromDate(new Date(2026, 5, 8)),
  },
];

export async function seedFirestore() {
  try {
    for (const book of SEED_BOOKS) {
      const ref = doc(db, "books", book.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const { id, ...data } = book;
        await setDoc(ref, data);
      }
    }
    for (const review of SEED_REVIEWS) {
      const ref = doc(db, "reviews", review.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const { id, ...data } = review;
        await setDoc(ref, data);
      }
    }
    for (const reply of SEED_REPLIES) {
      const ref = doc(db, "replies", reply.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const { id, ...data } = reply;
        await setDoc(ref, data);
      }
    }
  } catch (err) {
    // Client-side seeds are optional; may be blocked by production Firestore rules.
    console.warn("Skipping client seed:", err);
  }
}

/** Seeds a finished reading status on book-great-gatsby for the current user.
 *  Only runs when VITE_ENABLE_CLIENT_SEED=true and the user's name contains "ariane". */
export async function seedUserData(uid: string) {
  try {
    const statusRef = doc(db, "readingStatus", `${uid}_book-great-gatsby`);
    const snap = await getDoc(statusRef);
    if (!snap.exists()) {
      await setDoc(statusRef, { userId: uid, bookId: "book-great-gatsby", status: "finished" });
    }
  } catch (err) {
    console.warn("Skipping user seed:", err);
  }
}
