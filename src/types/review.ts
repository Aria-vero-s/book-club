import { Timestamp } from "firebase/firestore";

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  text: string;
  createdAt: Timestamp | null;
}

export interface Reply {
  id: string;
  reviewId: string;
  bookId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: Timestamp | null;
}

export interface ReadingStatus {
  id: string;
  userId: string;
  bookId: string;
  status: "reading" | "finished";
}
