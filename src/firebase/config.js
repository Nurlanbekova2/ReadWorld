import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgSaHBbsiEr3hujNwUqsdjqQUetOhk52U",
  authDomain: "readworld-a26e4.firebaseapp.com",
  projectId: "readworld-a26e4",
  storageBucket: "readworld-a26e4.firebasestorage.app",
  messagingSenderId: "333804184235",
  appId: "1:333804184235:web:72f3e6079f2d9bfdc30dee",
  measurementId: "G-YJBQE8RD2W",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;