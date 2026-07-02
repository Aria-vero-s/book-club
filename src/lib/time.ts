import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function relativeTime(ts: Timestamp | null): string {
  if (!ts?.toDate) return "";
  try {
    return formatDistanceToNow(ts.toDate(), { addSuffix: true });
  } catch {
    return "";
  }
}
