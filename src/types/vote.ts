/** A vote document — one per user (doc ID = user UID) using Firestore book IDs */
export interface Vote {
  id: string;
  userId: string;
  bookId: string;   // Firestore book document ID
  year: number;
  month: number;
}
