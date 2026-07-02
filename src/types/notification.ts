import { Timestamp } from "firebase/firestore";

/**
 * App notification. Only "reply" type is active after the token/support system
 * was removed. Legacy "support" documents in Firestore are silently ignored in
 * the UI.
 */
export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: "reply" | "support";   // "support" is legacy — ignored in the UI
  bookId?: string;
  bookTitle?: string;
  reviewId?: string;
  replyText?: string;
  read: boolean;
  createdAt: Timestamp | null;
}
