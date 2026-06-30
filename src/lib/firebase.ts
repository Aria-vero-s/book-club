import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB__4mhP_kY3ZU841HOwkUAMvrTI-cGKHA",
  authDomain: "the-blue-book-club.firebaseapp.com",
  projectId: "the-blue-book-club",
  storageBucket: "the-blue-book-club.firebasestorage.app",
  messagingSenderId: "618806688281",
  appId: "1:618806688281:web:7cb425ca4303ac03d94888",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
