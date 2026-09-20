import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAllBooks } from "../../services/bookService";
import { getUserFavorites } from "../../services/favoriteService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import BookCard from "../../components/books/BookCard";
import Spinner from "../../components/ui/Spinner";
import { FiSearch, FiFilter, FiArrowRight } from "react-icons/fi";

const ALL_CATEGORIES = [
  "All","Fiction","Non-Fiction","Science","Technology","History",
  "Biography","Fantasy","Mystery","Romance","Comedy","Drama",
  "Horror","Thriller","Adventure","Psychology","Philosophy","Poetry",
];

export default function Home() {
  const { currentUser } = useAuth();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books,     setBooks]     = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState(searchParams.get("search") || "");
  const [category,  setCategory]  = useState("All");
  const [sortBy,    setSortBy]    = useState("newest");

  const CAT_LABELS = {
    "All":        t.home.categories.all,
    "Fiction":    t.home.categories.fiction,
    "Non-Fiction":t.home.categories.nonFiction,
    "Science":    t.home.categories.science,
    "Technology": t.home.categories.technology,
    "History":    t.home.categories.history,
    "Biography":  t.home.categories.biography,
    "Fantasy":    t.home.categories.fantasy,
    "Mystery":    t.home.categories.mystery,
    "Romance":    t.home.categories.romance,
    "Comedy":     t.home.categories.comedy,
    "Drama":      t.home.categories.drama,
    "Horror":     t.home.categories.horror,
    "Thriller":   t.home.categories.thriller,
    "Adventure":  t.home.categories.adventure,
    "Psychology": t.home.categories.psychology,
    "Philosophy": t.home.categories.philosophy,
    "Poetry":     t.home.categories.poetry,
  };

  useEffect(() => {
    async function load() {
      try {
        const [b, favs] = await Promise.all([
          getAllBooks(),
          currentUser ? getUserFavorites(currentUser.uid) : Promise.resolve([]),
        ]);
        setBooks(b);
        setFavorites(favs.map((f) => f.bookId));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const filtered = useMemo(() => {
    let list = [...books];
    const q = search.toLowerCase();
    if (q) list = list.filter((b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q));
    if (category !== "All") list = list.filter((b) => b.category === category);
    if (sortBy === "newest")    list.sort((a, b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    if (sortBy === "oldest")    list.sort((a, b) => (a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
    if (sortBy === "priceLow")  list.sort((a, b) => Number(a.price)-Number(b.price));
    if (sortBy === "priceHigh") list.sort((a, b) => Number(b.price)-Number(a.price));
    if (sortBy === "rating")    list.sort((a, b) => Number(b.rating)-Number(a.rating));
    return list;
  }, [books, search, category, sortBy]);

  function handleSearch(e) {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            {t.home.heroTitle}<br />
            <span className="text-primary-200">{t.home.heroTitleHighlight}</span>
          </h1>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">{t.home.heroDesc}</p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm shadow-lg"
              />
            </div>
            <button type="submit" className="px-6 py-3.5 rounded-xl bg-white text-primary-700 font-semibold hover:bg-primary-50 transition shadow-lg text-sm">
              {t.home.searchBtn}
            </button>
          </form>
          {!currentUser && (
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <Link to="/register" className="px-5 py-2.5 rounded-xl bg-white text-primary-700 font-semibold hover:bg-primary-50 transition shadow">
                {t.home.getStarted}
              </Link>
              <Link to="/login" className="text-primary-200 hover:text-white flex items-center gap-1 transition">
                {t.home.signIn} <FiArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {ALL_CATEGORIES.map((key) => (
              <button key={key} onClick={() => setCategory(key)}
                className={"px-3.5 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap " +
                  (category === key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:border-primary-300")}>
                {CAT_LABELS[key] || key}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 self-end">
            <FiFilter className="text-gray-400" size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2 bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="newest">{t.home.sort.newest}</option>
              <option value="oldest">{t.home.sort.oldest}</option>
              <option value="priceLow">{t.home.sort.priceLow}</option>
              <option value="priceHigh">{t.home.sort.priceHigh}</option>
              <option value="rating">{t.home.sort.rating}</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
          {t.home.showing} <strong className="text-gray-800 dark:text-dark-text">{filtered.length}</strong> {t.home.books}
        </p>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">{t.home.noBooks}</h3>
            <p className="text-gray-500 dark:text-dark-muted">{t.home.noBooksDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} isFav={favorites.includes(book.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}