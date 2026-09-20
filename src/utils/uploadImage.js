import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Compress image and convert to base64 using canvas.
 * Resizes to max 600px wide, JPEG quality 0.75
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    // Timeout — if it takes more than 8s, reject
    const timeout = setTimeout(() => reject(new Error("base64 timeout")), 8000);

    const reader = new FileReader();
    reader.onerror = () => { clearTimeout(timeout); reject(reader.error); };
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => { clearTimeout(timeout); reject(new Error("Image load error")); };
      img.onload = () => {
        try {
          const MAX = 600;
          const ratio  = Math.min(1, MAX / Math.max(img.width, img.height));
          const w      = Math.round(img.width  * ratio);
          const h      = Math.round(img.height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width  = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          const b64 = canvas.toDataURL("image/jpeg", 0.75);
          clearTimeout(timeout);
          resolve(b64);
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Try Firebase Storage first; if it fails/times out, fall back to base64.
 */
export async function uploadBookCover(file, onProgress) {
  // ── Try Storage (3s timeout) ─────────────────────────────────────────
  const storageResult = await Promise.race([
    tryStorage(file, onProgress),
    new Promise((_, reject) => setTimeout(() => reject(new Error("storage timeout")), 5000)),
  ]).catch(() => null);

  if (storageResult) return storageResult;

  // ── Fallback: base64 ──────────────────────────────────────────────────
  console.info("[upload] Using base64 fallback");
  if (onProgress) onProgress(30);
  const b64 = await fileToBase64(file);
  if (onProgress) onProgress(100);
  return b64;
}

async function tryStorage(file, onProgress) {
  const fileName   = Date.now() + "_" + file.name.replace(/\s+/g, "_");
  const storageRef = ref(storage, "books/" + fileName);
  const task       = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress)
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      reject,
      async () => {
        try { resolve(await getDownloadURL(task.snapshot.ref)); }
        catch (e) { reject(e); }
      }
    );
  });
}
