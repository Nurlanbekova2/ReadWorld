import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, orderBy, where,
  serverTimestamp, getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "books";

export function hideDuplicateBooks(books) {
  const seen = new Set();
  return books.filter((book) => {
    const author = book.author?.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().trim();
    if (!author) return true;

    const titles = [
      book.title,
      ...Object.values(book.translations || {}).map((translation) => translation?.title),
    ].filter(Boolean);
    const keys = titles.map((title) => {
      const normalizedTitle = title
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "");
      return `${normalizedTitle}|${author}`;
    });

    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

export async function addBook(data) {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getAllBooks() {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return hideDuplicateBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function getBook(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) throw new Error("Book not found");
  return { id: snap.id, ...snap.data() };
}

export async function getRecentBooks(n = 5) {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return hideDuplicateBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() }))).slice(0, n);
}

export async function getBooksByCategory(category) {
  const snap = await getDocs(
    query(collection(db, COL), where("category", "==", category), orderBy("createdAt", "desc"))
  );
  return hideDuplicateBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function updateBook(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteBook(id) {
  await deleteDoc(doc(db, COL, id));
}

// Fast count — does NOT download documents
export async function getBooksCount() {
  const snap = await getCountFromServer(collection(db, COL));
  return snap.data().count;
}
