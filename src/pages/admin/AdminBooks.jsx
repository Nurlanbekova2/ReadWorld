import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllBooks, deleteBook } from "../../services/bookService";
import { useLang } from "../../i18n/index.jsx";
import Spinner from "../../components/ui/Spinner";
import ConfirmModal from "../../components/ui/ConfirmModal";
import StarRating from "../../components/ui/StarRating";
import { FiEdit2, FiTrash2, FiPlusCircle, FiSearch, FiFilter, FiBookOpen, FiInbox } from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";

const CATEGORY_KEYS = ["All","Fiction","Non-Fiction","Science","Technology","History","Biography","Fantasy","Mystery","Romance"];

export default function AdminBooks() {
  const { t } = useLang();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    try { setBooks(await getAllBooks()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

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

  async function handleDelete(id) {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      toast.success(t.adminBooks.deleteSuccess);
    } catch {
      toast.error(t.adminBooks.deleteFailed);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.adminBooks.title}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{books.length} {t.adminBooks.total}</p>
        </div>
        <Link to="/admin/books/add" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition shadow-sm">
          <FiPlusCircle size={16} /> {t.admin.addBook}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-4 mb-5 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" placeholder={t.adminBooks.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400">
          {CATEGORY_KEYS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" size={15} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="newest">{t.home.sort.newest}</option>
            <option value="oldest">{t.home.sort.oldest}</option>
            <option value="priceLow">{t.home.sort.priceLow}</option>
            <option value="priceHigh">{t.home.sort.priceHigh}</option>
            <option value="rating">{t.home.sort.rating}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-xs uppercase text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                {["cover","title","author","category","price","rating","added","actions"].map((col) => (
                  <th key={col} className={`px-5 py-3.5 ${col === "actions" ? "text-center" : "text-left"}`}>
                    {t.adminBooks.columns[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {filtered.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                  <td className="px-5 py-3">
                    {book.imageUrl
                      ? <img src={book.imageUrl} alt={book.title} className="w-10 h-13 object-cover rounded-lg shadow-sm" />
                      : <div className="w-10 h-13 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center"><FiBookOpen className="text-primary-500" /></div>
                    }
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800 dark:text-dark-text max-w-[220px]">
                    <div className="whitespace-normal break-words leading-5">{book.title}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-dark-muted max-w-[180px]">
                    <div className="whitespace-normal break-words leading-5">{book.author}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 whitespace-nowrap">{book.category || "—"}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-700 dark:text-dark-text whitespace-nowrap">{Number(book.price||0).toFixed(0)} сом</td>
                  <td className="px-5 py-3"><StarRating rating={book.rating||0} size={12} /></td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {book.createdAt ? format(new Date(book.createdAt.seconds*1000), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/admin/books/edit/${book.id}`} className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition" title={t.edit}>
                        <FiEdit2 size={15} />
                      </Link>
                      <button onClick={() => setDeleteTarget(book)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition" title={t.delete}>
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FiInbox className="mx-auto mb-3 text-gray-300" size={48} aria-hidden="true" />
              <p>{t.adminBooks.noBooks}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title={t.adminBooks.confirmDelete}
        message={`${t.adminBooks.confirmDeleteMsg} "${deleteTarget?.title}"? ${t.adminBooks.cannotUndo}`}
      />
    </div>
  );
}