import { collection, getDocs, doc, updateDoc, getDoc, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase/config";

const COL = "users";

export async function getAllUsers() {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fast count
export async function getUsersCount() {
  const snap = await getCountFromServer(collection(db, COL));
  return snap.data().count;
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COL, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, COL, uid), { role });
}
