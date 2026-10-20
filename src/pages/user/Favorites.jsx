import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { getUserFavorites } from "../../services/favoriteService";
import { getBook, hideDuplicateBooks } from "../../services/bookService";
import Spinner from "../../components/ui/Spinner";
import BookCard from "../../components/books/BookCard";
import { FiHeart } from "react-icons/fi";

export default function Favorites() {
  const { currentUser } = useAuth();
  const { t } = useLang();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!currentUser) return;
    try {
      const favs = await getUserFavorites(currentUser.uid);
      const details = await Promise.all(favs.map((f) => getBook(f.bookId).catch(() => null)));
      setBooks(hideDuplicateBooks(details.filter(Boolean)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [currentUser]);

  if (loading) return <Spinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
            <FiHeart className="text-red-500" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.favorites.title}</h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              {books.length} {books.length === 1 ? t.favorites.saved : t.favorites.savedPlural}
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart className="mx-auto mb-4 text-gray-300" size={64} aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">{t.favorites.noFavs}</h3>
            <p className="text-gray-500 dark:text-dark-muted mb-6">{t.favorites.noFavsDesc}</p>
            <Link to="/" className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition">
              {t.favorites.browseBooks}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} isFav={true} onFavChange={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}