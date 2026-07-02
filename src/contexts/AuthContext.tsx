import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

// ─── Mock mode ────────────────────────────────────────────────────────────────
// Set VITE_MOCK_AUTH=true in .env to bypass Google Auth during development.
// Must be false for real Firebase reads/writes to work correctly.
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === "true";

const MOCK_USER = {
  uid: "mock-user-dev",
  displayName: "Dev User",
  email: "dev@bookclub.dev",
  photoURL: "https://i.pravatar.cc/150?u=dev",
} as unknown as User;
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

async function ensureUserDoc(firebaseUser: User) {
  const userRef = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      tokenBalance: 0,
      booksFinished: 0,
      booksSuggested: 0,
      supportsReceived: 0,
      createdAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_AUTH ? MOCK_USER : null);
  const [loading, setLoading] = useState(!MOCK_AUTH);

  useEffect(() => {
    if (MOCK_AUTH) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) await ensureUserDoc(result.user);
      })
      .catch((err) => console.error("Redirect sign-in error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) await ensureUserDoc(firebaseUser);
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    if (MOCK_AUTH) return;
    await signInWithRedirect(auth, googleProvider);
  };

  const logOut = async () => {
    if (MOCK_AUTH) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
