import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllBooks } from "../../services/bookService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import BookCard from "../../components/books/BookCard";
import Spinner from "../../components/ui/Spinner";
import {
  FiAperture, FiArchive, FiArrowRight, FiActivity, FiBook, FiBookOpen,
  FiCompass, FiEye, FiFeather, FiFilm, FiGrid, FiHeart, FiMonitor,
  FiSmile, FiStar, FiTrendingUp, FiUser, FiUsers, FiZap,
} from "react-icons/fi";

const FEATURED_CATS = [
  { key: "Fiction",    Icon: FiFeather },
  { key: "Fantasy",    Icon: FiAperture },
  { key: "Horror",     Icon: FiEye },
  { key: "Comedy",     Icon: FiSmile },
  { key: "Drama",      Icon: FiFilm },
  { key: "Thriller",   Icon: FiZap },
  { key: "Romance",    Icon: FiHeart },
  { key: "Adventure",  Icon: FiCompass },
  { key: "Science",    Icon: FiActivity },
  { key: "Technology", Icon: FiMonitor },
  { key: "History",    Icon: FiArchive },
  { key: "Biography",  Icon: FiUser },
];

export default function Home() {
  const { currentUser } = useAuth();
  const { t } = useLang();
  const readingCopy = t.home.readingDashboard;
  const [topBooks, setTopBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getAllBooks().then((all) => {
      const byRating = [...all].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      const byDate   = [...all].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTopBooks(byRating.slice(0, 6));
      setNewBooks(byDate.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-sm font-medium mb-5">
              <FiBookOpen size={14} /> ReadWorld
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              {t.home.heroTitle}<br />
              <span className="text-primary-200">{t.home.heroTitleHighlight}</span>
            </h1>
            <p className="text-primary-100 text-lg mb-8 max-w-md">{t.home.heroDesc}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/books" className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-primary-700 font-semibold hover:bg-primary-50 transition shadow-lg text-sm">
                {t.nav.browse} <FiArrowRight size={16} />
              </Link>
              {!currentUser && (
                <Link to="/register" className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition border border-white/30 text-sm">
                  {t.home.getStarted}
                </Link>
              )}
            </div>
          </div>
          {/* Stat cards */}
          <div className="flex md:flex-col gap-3 shrink-0">
            {[
              { Icon: FiBook, value: "100+", label: t.admin.totalBooks },
              { Icon: FiStar, value: "4.8",  label: t.admin.totalReviews },
              { Icon: FiUsers, value: "1K+",  label: t.admin.totalUsers },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 text-center border border-white/20 min-w-[90px]">
                <s.Icon className="mx-auto mb-1" size={24} aria-hidden="true" />
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-primary-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Genres grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-2">
              <FiGrid className="text-primary-500" size={20} aria-hidden="true" /> {readingCopy.genres}
            </h2>
            <Link to="/books" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t.viewAll} <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {FEATURED_CATS.map(({ key, Icon }) => (
              <Link key={key} to={"/books?category=" + key}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <Icon className="text-primary-500 group-hover:scale-110 transition-transform" size={30} aria-hidden="true" />
                <span className="text-xs font-semibold text-gray-600 dark:text-dark-muted group-hover:text-primary-600 text-center leading-tight">
                  {t.home.categories[key.toLowerCase()] || key}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top rated */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-2">
              <FiStar className="text-yellow-400" size={20} /> {t.home.sort.rating}
            </h2>
            <Link to="/books?sort=rating" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t.viewAll} <FiArrowRight size={14} />
            </Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topBooks.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </section>

        {/* New arrivals */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-2">
              <FiTrendingUp className="text-primary-500" size={20} /> {t.home.sort.newest}
            </h2>
            <Link to="/books?sort=newest" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              {t.viewAll} <FiArrowRight size={14} />
            </Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {newBooks.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </section>

        {/* CTA for guests */}
        {!currentUser && (
          <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t.auth.createAccount}</h2>
            <p className="text-primary-200 mb-6 max-w-md mx-auto text-sm">{t.home.heroDesc}</p>
            <div className="flex gap-3 justify-center">
              <Link to="/register" className="px-6 py-3 rounded-xl bg-white text-primary-700 font-semibold hover:bg-primary-50 transition shadow">
                {t.auth.signUp}
              </Link>
              <Link to="/login" className="px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition font-medium text-sm">
                {t.auth.signIn}
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}