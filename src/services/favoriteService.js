import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "favorites";

export async function addFavorite(userId, bookId) {
  return addDoc(collection(db, COL), { userId, bookId });
}

export async function removeFavorite(userId, bookId) {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where("userId", "==", userId),
      where("bookId", "==", bookId)
    )
  );
  const deletes = snap.docs.map((d) => deleteDoc(doc(db, COL, d.id)));
  await Promise.all(deletes);
}

export async function getUserFavorites(userId) {
  const snap = await getDocs(
    query(collection(db, COL), where("userId", "==", userId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function isFavorite(userId, bookId) {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where("userId", "==", userId),
      where("bookId", "==", bookId)
    )
  );
  return !snap.empty;
}
