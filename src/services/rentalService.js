import {
  collection, addDoc, updateDoc, getDocs, doc,
  query, where, orderBy, serverTimestamp, getCountFromServer,
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

export async function getUserRentals(userId) {
  const snap = await getDocs(
    query(collection(db, COL), where("userId", "==", userId), orderBy("borrowedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

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

export async function getAllRentals() {
  const snap = await getDocs(
    query(collection(db, COL), orderBy("borrowedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fast count — only active rentals
export async function getActiveRentalsCount() {
  const snap = await getCountFromServer(
    query(collection(db, COL), where("status", "==", "active"))
  );
  return snap.data().count;
}
