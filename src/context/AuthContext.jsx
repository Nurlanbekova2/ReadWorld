import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser,    setCurrentUser]    = useState(null);
  const [userProfile,    setUserProfile]    = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setProfileLoading(true);
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          console.log("[Auth] uid:", user.uid);
          console.log("[Auth] doc exists:", snap.exists());
          console.log("[Auth] profile data:", snap.data());
          setUserProfile(snap.exists() ? snap.data() : null);
        } catch (e) {
          console.error("[Auth] Firestore read error:", e.code, e.message);
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function register(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = { uid: cred.user.uid, name, email, role: "user", createdAt: serverTimestamp() };
    await setDoc(doc(db, "users", cred.user.uid), profile);
    setUserProfile(profile);
    return cred;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    console.log("[Login] uid:", cred.user.uid);
    console.log("[Login] doc exists:", snap.exists());
    console.log("[Login] profile:", snap.data());
    const profile = snap.exists() ? snap.data() : null;
    setUserProfile(profile);
    return { cred, profile };
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    const ref  = doc(db, "users", cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const profile = { uid: cred.user.uid, name: cred.user.displayName, email: cred.user.email, role: "user", createdAt: serverTimestamp() };
      await setDoc(ref, profile);
      setUserProfile(profile);
    } else {
      setUserProfile(snap.data());
    }
    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  const isAdmin = userProfile?.role === "admin";

  console.log("[Context] userProfile:", userProfile, "| isAdmin:", isAdmin);

  const value = { currentUser, userProfile, loading, profileLoading, isAdmin, register, login, loginWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}