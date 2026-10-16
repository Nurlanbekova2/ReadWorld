import {
  collection, addDoc, updateDoc, getDocs, doc,
  query, where, serverTimestamp, getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "rentals";

export async function borrowBook({ userId, bookId, bookTitle, userName, phone, dueDate }) {
  return addDoc(collection(db, COL), {
    userId, bookId, bookTitle, userName, phone, dueDate,
    borrowedAt: serverTimestamp(),
    status: "active",
  });
}

export async function returnBook(rentalId) {
  await updateDoc(doc(db, COL, rentalId), {
    status: "returned",
    returnedAt: serverTimestamp(),
  });
}

// No orderBy — sort in JS to avoid composite index requirement
export async function getUserRentals(userId) {
  const snap = await getDocs(
    query(collection(db, COL), where("userId", "==", userId))
  );
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.borrowedAt?.seconds || 0) - (a.borrowedAt?.seconds || 0));
}

// Check if user already borrowed this book (active)
export async function isBookBorrowed(userId, bookId) {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where("userId", "==", userId),
      where("bookId", "==", bookId),
      where("status", "==", "active")
    )
  );
  return !snap.empty;
}

// Get all borrowed bookIds for a user (active only) — used in BorrowPage
export async function getUserActiveBorrowedIds(userId) {
  const snap = await getDocs(
    query(collection(db, COL), where("userId", "==", userId), where("status", "==", "active"))
  );
  return snap.docs.map((d) => d.data().bookId);
}

// Admin: get all rentals, sort in JS
export async function getAllRentals() {
  const snap = await getDocs(collection(db, COL));
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.borrowedAt?.seconds || 0) - (a.borrowedAt?.seconds || 0));
}

// Fast count of active rentals
export async function getActiveRentalsCount() {
  const snap = await getCountFromServer(
    query(collection(db, COL), where("status", "==", "active"))
  );
  return snap.data().count;
}
