// Firebase Configuration - Your Real Credentials
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfXDEZ_adnxEy48btk7mmKUurZaErbrH8",
  authDomain: "personal-password-vault-71cd7.firebaseapp.com",
  projectId: "personal-password-vault-71cd7",
  storageBucket: "personal-password-vault-71cd7.firebasestorage.app",
  messagingSenderId: "1072747028062",
  appId: "1:1072747028062:web:ec42d40758850a18475ecf"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

export default app;