import {
  collection, addDoc, getDocs, query, where,
  orderBy, serverTimestamp, deleteDoc, doc, getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "reviews";

export async function addReview({ userId, bookId, username, comment, rating }) {
  return addDoc(collection(db, COL), {
    userId, bookId, username, comment,
    rating: Number(rating),
    createdAt: serverTimestamp(),
  });
}

export async function getReviewsForBook(bookId) {
  try {
    // Requires composite index: bookId ASC + createdAt DESC
    const snap = await getDocs(
      query(collection(db, COL), where("bookId", "==", bookId), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    if (err.code === "failed-precondition") {
      // Index not ready yet — fall back: filter in JS, sort manually
      console.warn("Index missing for reviews, using fallback query");
      const snap = await getDocs(
        query(collection(db, COL), where("bookId", "==", bookId))
      );
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort by createdAt descending in JS
      return docs.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0;
        const tb = b.createdAt?.seconds || 0;
        return tb - ta;
      });
    }
    throw err;
  }
}

export async function deleteReview(reviewId) {
  await deleteDoc(doc(db, COL, reviewId));
}

// Fast count
export async function getReviewsCount() {
  const snap = await getCountFromServer(collection(db, COL));
  return snap.data().count;
}
