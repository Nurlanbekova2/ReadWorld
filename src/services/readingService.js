import {
  collection, updateDoc, deleteDoc, getDocs,
  doc, query, where, setDoc, getDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// ── Collections ───────────────────────────────────────────────────────────
const READING_LIST = "readingList";  // { userId, bookId, bookTitle, bookAuthor, imageUrl, status, totalPages, addedAt }
const DAILY_LOGS   = "dailyLogs";   // { userId, bookId, bookTitle, pages, date (YYYY-MM-DD), loggedAt }
const USER_STATS   = "userStats";   // { userId, xp, streak, lastLogDate, badges: [] }

// ── Reading List ──────────────────────────────────────────────────────────
export async function addToReadingList({ userId, bookId, bookTitle, bookAuthor, imageUrl, translations = {}, status, totalPages = 0 }) {
  // Use userId_bookId as doc id to prevent duplicates
  const id = userId + "_" + bookId;
  await setDoc(doc(db, READING_LIST, id), {
    userId, bookId, bookTitle, bookAuthor, imageUrl, translations,
    status,        // "want" | "reading" | "done"
    totalPages: Number(totalPages),
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateReadingStatus(userId, bookId, status) {
  const id = userId + "_" + bookId;
  await updateDoc(doc(db, READING_LIST, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function removeFromReadingList(userId, bookId) {
  await deleteDoc(doc(db, READING_LIST, userId + "_" + bookId));
}

export async function getUserReadingList(userId) {
  const snap = await getDocs(
    query(collection(db, READING_LIST), where("userId", "==", userId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getReadingEntry(userId, bookId) {
  const snap = await getDoc(doc(db, READING_LIST, userId + "_" + bookId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Daily Logs ────────────────────────────────────────────────────────────
export async function logDailyPages({ userId, bookId, bookTitle, pages }) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  // One log per book per day — overwrite if exists
  const id = userId + "_" + bookId + "_" + today;
  await setDoc(doc(db, DAILY_LOGS, id), {
    userId, bookId, bookTitle,
    pages: Number(pages),
    date: today,
    loggedAt: serverTimestamp(),
  }, { merge: true });
  // Update XP and streak
  await updateStats(userId, Number(pages));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("readworld:reading-stats-updated", {
      detail: { userId },
    }));
  }
  return id;
}

export async function getUserDailyLogs(userId) {
  const snap = await getDocs(
    query(collection(db, DAILY_LOGS), where("userId", "==", userId))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Stats & XP & Badges ───────────────────────────────────────────────────
const XP_PER_PAGE = 2;

export async function getUserStats(userId) {
  const snap = await getDoc(doc(db, USER_STATS, userId));
  if (snap.exists()) return snap.data();
  return { xp: 0, streak: 0, lastLogDate: null, badges: [] };
}

export async function updateStats(userId, pagesRead) {
  const today = new Date().toISOString().slice(0, 10);
  const current = await getUserStats(userId);

  const lastDate = current.lastLogDate || "";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  // Streak logic
  let streak = current.streak || 0;
  if (lastDate === today) {
    // Already logged today — just add XP
  } else if (lastDate === yStr) {
    streak += 1; // consecutive day
  } else {
    streak = 1;  // streak broken or first log
  }

  const newXp = (current.xp || 0) + pagesRead * XP_PER_PAGE;

  // Calculate badges
  const badges = calcBadges({ xp: newXp, streak, lastLogDate: today });

  await setDoc(doc(db, USER_STATS, userId), {
    userId,
    xp: newXp,
    streak,
    lastLogDate: today,
    badges,
  }, { merge: true });
}

// ── Badge definitions ─────────────────────────────────────────────────────
export const BADGE_DEFS = [
  { id: "first_page",   emoji: "📖", xpReq: 1,    streakReq: 0 },
  { id: "week_streak",  emoji: "🔥", xpReq: 0,    streakReq: 7 },
  { id: "bookworm",     emoji: "🐛", xpReq: 500,  streakReq: 0 },
  { id: "reader_100",   emoji: "💯", xpReq: 200,  streakReq: 0 },
  { id: "month_streak", emoji: "🏆", xpReq: 0,    streakReq: 30 },
  { id: "legend",       emoji: "👑", xpReq: 5000, streakReq: 0 },
  { id: "night_owl",    emoji: "🦉", xpReq: 1000, streakReq: 0 },
  { id: "consistent",   emoji: "⚡", xpReq: 0,    streakReq: 14 },
];

function calcBadges({ xp, streak }) {
  return BADGE_DEFS
    .filter((b) => xp >= b.xpReq && streak >= b.streakReq)
    .map((b) => b.id);
}

// XP level thresholds
export function getLevel(xp) {
  const levels = [
    { level: 1, min: 0,    max: 100,  label: "Новичок" },
    { level: 2, min: 100,  max: 300,  label: "Читатель" },
    { level: 3, min: 300,  max: 600,  label: "Любитель" },
    { level: 4, min: 600,  max: 1000, label: "Знаток" },
    { level: 5, min: 1000, max: 2000, label: "Эксперт" },
    { level: 6, min: 2000, max: 5000, label: "Мастер" },
    { level: 7, min: 5000, max: 9999, label: "Легенда" },
  ];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].min) return { ...levels[i], xp, pct: Math.min(100, Math.round(((xp - levels[i].min) / (levels[i].max - levels[i].min)) * 100)) };
  }
  return levels[0];
}
