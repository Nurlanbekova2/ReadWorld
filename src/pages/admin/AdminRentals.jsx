import { useEffect, useState } from "react";
import { getAllRentals, returnBook } from "../../services/rentalService";
import { useLang } from "../../i18n/index.jsx";
import Spinner from "../../components/ui/Spinner";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { FiBookOpen, FiPhone, FiCheckCircle, FiAlertCircle, FiClock, FiSearch } from "react-icons/fi";
import { format, isPast, parseISO } from "date-fns";
import toast from "react-hot-toast";

export default function AdminRentals() {
  const { t } = useLang();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [returnTarget, setReturnTarget] = useState(null);

  async function load() {
    try {
      setRentals(await getAllRentals());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleReturn(rentalId) {
    try {
      await returnBook(rentalId);
      toast.success(t.adminRentals.returnSuccess);
      load();
    } catch {
      toast.error("Error");
    }
  }

  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.bookTitle?.toLowerCase().includes(q) ||
      r.userName?.toLowerCase().includes(q) ||
      r.phone?.includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount   = rentals.filter((r) => r.status === "active").length;
  const returnedCount = rentals.filter((r) => r.status === "returned").length;

  if (loading) return <Spinner />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.adminRentals.title}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            {rentals.length} {t.adminRentals.total}
          </p>
        </div>
        {/* Stats pills */}
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            <FiClock className="inline mr-1" size={11} />{t.rental.active}: {activeCount}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <FiCheckCircle className="inline mr-1" size={11} />{t.rental.returned}: {returnedCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-4 mb-5 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" placeholder={t.adminBooks.searchPlaceholder}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <div className="flex gap-2">
          {["all", "active", "returned"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={"px-3.5 py-1.5 rounded-full text-xs font-semibold transition " +
                (filterStatus === s
                  ? "bg-primary-600 text-white"
                  : "border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:border-primary-400")}>
              {s === "all" ? t.adminRentals.allRentals : s === "active" ? t.rental.active : t.rental.returned}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="text-xs uppercase text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <th className="px-5 py-3.5 text-left">{t.adminRentals.columns.book}</th>
                <th className="px-5 py-3.5 text-left">{t.adminRentals.columns.user}</th>
                <th className="px-5 py-3.5 text-left">{t.adminRentals.columns.phone}</th>
                <th className="px-5 py-3.5 text-left">{t.adminRentals.columns.borrowedOn}</th>
                <th className="px-5 py-3.5 text-left">{t.adminRentals.columns.dueOn}</th>
                <th className="px-5 py-3.5 text-left">{t.adminRentals.columns.status}</th>
                <th className="px-5 py-3.5 text-center">{t.adminRentals.columns.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {filtered.map((rental) => {
                const isOverdue = rental.status === "active" && isPast(parseISO(rental.dueDate));
                return (
                  <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                    {/* Book */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                          <FiBookOpen size={14} className="text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-dark-text line-clamp-1 max-w-[150px]">
                          {rental.bookTitle}
                        </span>
                      </div>
                    </td>
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <span className="text-gray-700 dark:text-dark-text font-medium">{rental.userName}</span>
                    </td>
                    {/* Phone */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-dark-muted">
                        <FiPhone size={12} className="text-gray-400 shrink-0" />
                        <span className="font-mono text-sm">{rental.phone}</span>
                      </div>
                    </td>
                    {/* Borrowed */}
                    <td className="px-5 py-3.5 text-gray-500 dark:text-dark-muted text-xs whitespace-nowrap">
                      {rental.borrowedAt
                        ? format(new Date(rental.borrowedAt.seconds * 1000), "dd MMM yyyy")
                        : "—"}
                    </td>
                    {/* Due */}
                    <td className={"px-5 py-3.5 text-xs whitespace-nowrap font-medium " +
                      (isOverdue ? "text-red-500" : "text-gray-600 dark:text-dark-muted")}>
                      {rental.dueDate}
                      {isOverdue && <span className="ml-1 text-red-400">(!)</span>}
                    </td>
                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold " +
                        (rental.status === "returned"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : isOverdue
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                            : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300")}>
                        {rental.status === "returned"
                          ? <><FiCheckCircle size={10} /> {t.rental.returned}</>
                          : isOverdue
                            ? <><FiAlertCircle size={10} /> {t.rental.overdue}</>
                            : <><FiClock size={10} /> {t.rental.active}</>}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5 text-center">
                      {rental.status === "active" ? (
                        <button onClick={() => setReturnTarget(rental)}
                          className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 text-xs font-semibold transition whitespace-nowrap">
                          <FiCheckCircle className="inline mr-1" size={11} />
                          {t.adminRentals.markReturned}
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-dark-border text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FiBookOpen size={36} className="mx-auto mb-3 opacity-30" />
              <p>{t.adminRentals.noRentals}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={() => handleReturn(returnTarget?.id)}
        title={t.rental.returnConfirm}
        message={t.rental.returnConfirmMsg + ": \"" + (returnTarget?.bookTitle || "") + "\"?"}
      />
    </div>
  );
}
