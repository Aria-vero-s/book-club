import { Timestamp } from "firebase/firestore";

/** A book stored in Firestore (current Book of the Month or past reads) */
export interface FirestoreBook {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  month: number;
  year: number;
  isCurrent: boolean;
}

/** A search result document from the Open Library Search API */
export interface OLBook {
  key: string;              // e.g. "/works/OL82563W"
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

/** User's favorited book — stored in Firestore `favorites` collection */
export interface Favorite {
  id: string;
  userId: string;
  bookKey: string;
  bookTitle: string;
  bookAuthor: string;
  coverI?: number;
  addedAt: Timestamp | null;
}

/** User's "Want to Read" entry — stored in Firestore `wantToRead` collection */
export interface WantToRead {
  id: string;
  userId: string;
  bookKey: string;
  bookTitle: string;
  bookAuthor: string;
  coverI?: number;
  addedAt: Timestamp | null;
}

/** User's monthly book nomination — one per user per calendar month */
export interface Nomination {
  id: string;
  userId: string;
  bookKey: string;
  bookTitle: string;
  bookAuthor: string;
  coverI?: number;
  year: number;
  month: number;
  nominatedAt: Timestamp | null;
}
