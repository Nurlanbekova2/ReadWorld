import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllBooks } from "../../services/bookService";
import { getUserFavorites } from "../../services/favoriteService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import en from "../../i18n/en";
import ru from "../../i18n/ru";
import ky from "../../i18n/ky";
import BookCard from "../../components/books/BookCard";
import Spinner from "../../components/ui/Spinner";
import { FiBookOpen, FiSearch, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";

const ALL_CATEGORIES = [
  "All","Fiction","Non-Fiction","Science","Technology","History",
  "Biography","Fantasy","Mystery","Romance","Comedy","Drama",
  "Horror","Thriller","Adventure","Psychology","Philosophy","Poetry","Other",
];
const CATEGORY_DICTIONARIES = [en, ru, ky];

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[ё]/g, "е")
    .trim();
}

function getCategoryAliases(category) {
  const normalizedCategory = normalizeSearch(category);
  const translationKey = normalizedCategory.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return [
    category,
    ...CATEGORY_DICTIONARIES
      .map((dictionary) => dictionary.home.categories[translationKey])
      .filter(Boolean),
  ].map(normalizeSearch);
}

function matchesCategory(bookCategory, selectedCategory) {
  if (selectedCategory === "All") return true;
  const selectedAliases = getCategoryAliases(selectedCategory);
  return selectedAliases.includes(normalizeSearch(bookCategory));
}

function matchesSearch(book, searchQuery) {
  const query = normalizeSearch(searchQuery);
  if (!query) return true;

  const searchableFields = [
    book.title,
    book.author,
    book.category,
    ...Object.values(book.translations || {}).flatMap((translation) => [
      translation?.title,
      translation?.author,
      translation?.category,
    ]),
    ...Object.entries(book)
      .filter(([field]) => /^(title|author|category)(_|[A-Z])/i.test(field))
      .map(([, value]) => value),
  ].map(normalizeSearch).filter(Boolean);

  if (searchableFields.some((field) => field.includes(query))) return true;

  return ALL_CATEGORIES.some((category) =>
    getCategoryAliases(category).some((alias) => alias.includes(query))
    && getCategoryAliases(category).includes(normalizeSearch(book.category))
  );
}

export default function Books() {
  const { currentUser } = useAuth();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books,     setBooks]     = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search,    setSearch]    = useState(searchParams.get("search") || "");
  const [category,  setCategory]  = useState(searchParams.get("category") || "All");
  const [sortBy,    setSortBy]    = useState(searchParams.get("sort") || "newest");

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
    "Other":      t.home.categories.other,
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks);
      if (currentUser) {
        try {
          const userFavorites = await getUserFavorites(currentUser.uid);
          setFavorites(userFavorites.map((favorite) => favorite.bookId));
        } catch (error) {
          console.error("Could not load book favorites:", error);
          setFavorites([]);
          toast.error(t.bookDetails.favoriteFailed);
        }
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Could not load books:", error);
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, t.bookDetails.favoriteFailed]);

  useEffect(() => {
    load();
  }, [load]);

  // Sync searchParams -> state
  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
    setSortBy(searchParams.get("sort") || "newest");
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...books];
    if (search.trim()) list = list.filter((book) => matchesSearch(book, search));
    if (category !== "All") list = list.filter((book) => matchesCategory(book.category, category));
    if (sortBy === "newest")    list.sort((a, b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    if (sortBy === "oldest")    list.sort((a, b) => (a.createdAt?.seconds||0)-(b.createdAt?.seconds||0));
    if (sortBy === "priceLow")  list.sort((a, b) => Number(a.price)-Number(b.price));
    if (sortBy === "priceHigh") list.sort((a, b) => Number(b.price)-Number(a.price));
    if (sortBy === "rating")    list.sort((a, b) => Number(b.rating)-Number(a.rating));
    return list;
  }, [books, search, category, sortBy]);

  function handleSearch(event) {
    event.preventDefault();
    const p = {};
    if (search.trim()) p.search = search.trim();
    if (category !== "All") p.category = category;
    if (sortBy !== "newest") p.sort = sortBy;
    setSearchParams(p);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Page header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-4">
            <FiBookOpen className="mr-2 inline-block" aria-hidden="true" /> {t.nav.browse}
          </h1>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition">
              {t.home.searchBtn}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
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
            <FiFilter className="text-gray-400" size={15} />
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

        <p className="text-sm text-gray-500 dark:text-dark-muted mb-5">
          {t.home.showing} <strong className="text-gray-800 dark:text-dark-text">{filtered.length}</strong> {t.home.books}
          {category !== "All" && <span> — {CAT_LABELS[category] || category}</span>}
          {search && <span> — "{search}"</span>}
        </p>

        {loading ? (
          <Spinner />
        ) : loadError ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-dark-muted mb-4">{loadError.message}</p>
            <button onClick={load} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
              {t.readingTracker.errors.retry}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiBookOpen className="mx-auto mb-4 text-gray-300" size={64} aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">{t.home.noBooks}</h3>
            <p className="text-gray-500 dark:text-dark-muted">{t.home.noBooksDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} isFav={favorites.includes(book.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}