import { Link } from "react-router-dom";
import { useState } from "react";
import { FiBookOpen, FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import StarRating from "../ui/StarRating";
import { useLang } from "../../i18n/index.jsx";
import { useAuth } from "../../context/AuthContext";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import { localizeBook } from "../../utils/localizeBook";
import toast from "react-hot-toast";

export default function BookCard({ book, isFav = false, onFavChange }) {
  const { currentUser } = useAuth();
  const { lang, t } = useLang();
  const localizedBook = localizeBook(book, lang, t);
  const [fav, setFav] = useState(isFav);
  const [loading, setLoading] = useState(false);

  async function toggleFav(e) {
    e.preventDefault();
    if (!currentUser) { toast.error(t.bookDetails.loginToFav); return; }
    setLoading(true);
    try {
      if (fav) {
        await removeFavorite(currentUser.uid, book.id);
        setFav(false);
        toast.success(t.bookDetails.removedFromFav);
      } else {
        await addFavorite(currentUser.uid, book.id);
        setFav(true);
        toast.success(t.bookDetails.addedToFav);
      }
      onFavChange?.();
    } catch (error) {
      console.error("Favorite update error:", error);
      toast.error(t.bookDetails.favoriteFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link to={`/books/${book.id}`} className="group block">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-dark-bg">
          {book.imageUrl ? (
            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
              <FiBookOpen className="text-primary-500" size={36} aria-hidden="true" />
            </div>
          )}
          <button onClick={toggleFav} disabled={loading}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 shadow hover:scale-110 transition-transform"
            aria-label={fav ? t.bookDetails.removeFromFavorites : t.bookDetails.addToFavorites}>
            {fav ? <FaHeart className="text-red-500" size={16} /> : <FiHeart className="text-gray-500" size={16} />}
          </button>
          {localizedBook.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-600 text-white shadow">{localizedBook.category}</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text line-clamp-1 group-hover:text-primary-600 transition-colors">{localizedBook.title}</h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5 line-clamp-1">{localizedBook.author}</p>
          <div className="flex items-center justify-between mt-3">
            <StarRating rating={book.rating || 0} size={13} showValue />
            <span className="text-primary-600 dark:text-primary-400 font-bold text-base">{Number(book.price || 0).toFixed(0)} сом</span>
          </div>
        </div>
      </div>
    </Link>
  );
}