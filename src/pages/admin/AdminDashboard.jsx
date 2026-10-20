import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooksCount, getRecentBooks } from "../../services/bookService";
import { getUsersCount } from "../../services/userService";
import { getReviewsCount } from "../../services/reviewService";
import { getActiveRentalsCount } from "../../services/rentalService";
import { useLang } from "../../i18n/index.jsx";
import { FiBook, FiUsers, FiMessageSquare, FiPlusCircle, FiArrowRight, FiBookOpen } from "react-icons/fi";
import { seedKyrgyzBooks } from "../../utils/seedData";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

function Skeleton({ className = "" }) {
  return <div className={"animate-pulse rounded-xl bg-gray-200 dark:bg-dark-border " + className} />;
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-3"><Skeleton className="w-9 h-12 rounded-lg" /></td>
      <td className="px-6 py-3"><Skeleton className="h-4 w-32" /></td>
      <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-3"><Skeleton className="h-4 w-12" /></td>
      <td className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
    </tr>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, to }) {
  const inner = (
    <div className={"bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm flex items-center gap-5 " +
      (to ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" : "")}>
      <div className={"w-14 h-14 rounded-2xl " + bg + " flex items-center justify-center shrink-0"}>
        <Icon className={color} size={26} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-dark-text mt-0.5">
          {value === null
            ? <span className="inline-block animate-pulse bg-gray-200 dark:bg-dark-border rounded-lg h-8 w-12" />
            : value === "err"
              ? <span className="text-red-400 text-lg">—</span>
              : value.toLocaleString()
          }
        </p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { lang, t } = useLang();
  const [stats, setStats]         = useState({ books: null, users: null, reviews: null, rentals: null });
  const [recent, setRecent]       = useState([]);
  const [tableReady, setTableReady] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    // Each stat loads independently — one failure does not block others
    getBooksCount()
      .then((n) => setStats((s) => ({ ...s, books: n })))
      .catch(() => setStats((s) => ({ ...s, books: "err" })));

    getUsersCount()
      .then((n) => setStats((s) => ({ ...s, users: n })))
      .catch(() => setStats((s) => ({ ...s, users: "err" })));

    getReviewsCount()
      .then((n) => setStats((s) => ({ ...s, reviews: n })))
      .catch(() => setStats((s) => ({ ...s, reviews: "err" })));

    getActiveRentalsCount()
      .then((n) => setStats((s) => ({ ...s, rentals: n })))
      .catch(() => setStats((s) => ({ ...s, rentals: "err" })));

    getRecentBooks(5)
      .then((books) => { setRecent(books); setTableReady(true); })
      .catch(() => setTableReady(true));
  }, []);

  async function importKyrgyzBooks() {
    setImporting(true);
    try {
      const { added, updated, skipped } = await seedKyrgyzBooks();
      toast.success(
        t.admin.importKyrgyzBooksSuccess
          .replace("{added}", String(added))
          .replace("{updated}", String(updated))
          .replace("{skipped}", String(skipped))
      );
      getBooksCount()
        .then((count) => setStats((current) => ({ ...current, books: count })))
        .catch((error) => {
          console.error("Could not refresh book count after import:", error);
          setStats((current) => ({ ...current, books: "err" }));
        });
      getRecentBooks(5)
        .then((books) => setRecent(books))
        .catch((error) => console.error("Could not refresh recent books after import:", error));
    } catch (error) {
      console.error("Kyrgyz books import error:", error);
      toast.error(t.admin.importKyrgyzBooksFailed);
    } finally {
      setImporting(false);
      setImportOpen(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.admin.dashboard}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{t.admin.welcomeBack}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-dark-bg text-sm font-semibold transition">
            <FiBook size={16} /> {t.admin.importKyrgyzBooks}
          </button>
          <Link to="/admin/books/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition shadow-sm">
            <FiPlusCircle size={16} /> {t.admin.addBook}
          </Link>
        </div>
      </div>

      <Modal isOpen={importOpen} onClose={() => !importing && setImportOpen(false)} title={t.admin.importKyrgyzBooksTitle}>
        <p className="text-sm text-gray-600 dark:text-dark-muted">{t.admin.importKyrgyzBooksPrompt}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => setImportOpen(false)} disabled={importing}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-bg">
            {t.cancel}
          </button>
          <button type="button" onClick={importKyrgyzBooks} disabled={importing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60">
            {importing ? t.admin.importingKyrgyzBooks : t.admin.importKyrgyzBooks}
          </button>
        </div>
      </Modal>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={FiBook}          label={t.admin.totalBooks}   value={stats.books}   color="text-primary-600" bg="bg-primary-50 dark:bg-primary-900/20"  to="/admin/books" />
        <StatCard icon={FiUsers}         label={t.admin.totalUsers}   value={stats.users}   color="text-green-600"   bg="bg-green-50 dark:bg-green-900/20"      to="/admin/users" />
        <StatCard icon={FiMessageSquare} label={t.admin.totalReviews} value={stats.reviews} color="text-purple-600"  bg="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard icon={FiBookOpen}      label={t.admin.totalRentals} value={stats.rentals} color="text-orange-600"  bg="bg-orange-50 dark:bg-orange-900/20"    to="/admin/rentals" />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="font-semibold text-gray-800 dark:text-dark-text">{t.admin.recentBooks}</h2>
          <Link to="/admin/books" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            {t.viewAll} <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-gray-400 dark:text-dark-muted border-b border-gray-100 dark:border-dark-border">
                <th className="px-6 py-3 text-left">{t.adminBooks.columns.cover}</th>
                <th className="px-6 py-3 text-left">{t.adminBooks.columns.title}</th>
                <th className="px-6 py-3 text-left">{t.adminBooks.columns.author}</th>
                <th className="px-6 py-3 text-left">{t.adminBooks.columns.category}</th>
                <th className="px-6 py-3 text-left">{t.adminBooks.columns.price}</th>
                <th className="px-6 py-3 text-left">{t.adminBooks.columns.added}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {!tableReady
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                : recent.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                      <td className="px-6 py-3">
                        {book.imageUrl
                          ? <img src={book.imageUrl} alt={book.title} className="w-9 h-12 object-cover rounded-lg" />
                          : <div className="w-9 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center"><FiBookOpen className="text-primary-500" /></div>
                        }
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800 dark:text-dark-text max-w-[240px]">
                        <div className="whitespace-normal break-words leading-5">{book.title}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-500 dark:text-dark-muted max-w-[220px]">
                        <div className="whitespace-normal break-words leading-5">{book.author}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300">
                          {book.category || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800 dark:text-dark-text">
                        {Number(book.price || 0).toFixed(0)} сом
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {book.createdAt
                          ? new Intl.DateTimeFormat(
                              lang === "ky" ? "ky-KG" : lang === "ru" ? "ru-RU" : "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            ).format(new Date(book.createdAt.seconds * 1000))
                          : "-"}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {tableReady && recent.length === 0 && (
            <div className="text-center py-12 text-gray-400">{t.adminBooks.noBooks}</div>
          )}
        </div>
      </div>
    </div>
  );
}
