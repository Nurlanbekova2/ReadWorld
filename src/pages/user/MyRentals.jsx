import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { getUserRentals, returnBook } from "../../services/rentalService";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Spinner from "../../components/ui/Spinner";
import { FiBookOpen, FiPhone, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { format, isPast, parseISO } from "date-fns";
import toast from "react-hot-toast";

export default function MyRentals() {
  const { currentUser } = useAuth();
  const { t } = useLang();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState(null);

  async function load() {
    if (!currentUser) return;
    try {
      setRentals(await getUserRentals(currentUser.uid));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [currentUser]);

  async function handleReturn(rentalId) {
    try {
      await returnBook(rentalId);
      toast.success(t.bookDetails.returnSuccess);
      load();
    } catch {
      toast.error("Error");
    }
  }

  const active   = rentals.filter((r) => r.status === "active");
  const returned = rentals.filter((r) => r.status === "returned");

  if (loading) return <Spinner fullScreen />;

  function RentalCard({ rental }) {
    const isOverdue = rental.status === "active" && isPast(parseISO(rental.dueDate));
    return (
      <div className={"bg-white dark:bg-dark-surface rounded-2xl border shadow-sm overflow-hidden " +
        (isOverdue ? "border-red-200 dark:border-red-900/40" : "border-gray-100 dark:border-dark-border")}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={"w-11 h-11 rounded-xl flex items-center justify-center shrink-0 " +
                (rental.status === "returned"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : isOverdue ? "bg-red-100 dark:bg-red-900/30" : "bg-primary-100 dark:bg-primary-900/30")}>
                <FiBookOpen size={20} className={
                  rental.status === "returned" ? "text-green-600" :
                  isOverdue ? "text-red-500" : "text-primary-600"} />
              </div>
              <div>
                <Link to={"/books/" + rental.bookId}
                  className="font-semibold text-gray-900 dark:text-dark-text hover:text-primary-600 transition text-sm line-clamp-1">
                  {rental.bookTitle}
                </Link>
                <span className={"inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold " +
                  (rental.status === "returned"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : isOverdue
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300"
                      : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300")}>
                  {rental.status === "returned"
                    ? <><FiCheckCircle size={10} /> {t.rental.returned}</>
                    : isOverdue
                      ? <><FiAlertCircle size={10} /> {t.rental.overdue}</>
                      : <><FiClock size={10} /> {t.rental.active}</>}
                </span>
              </div>
            </div>
            {rental.status === "active" && (
              <button
                onClick={() => setReturnTarget(rental)}
                className="shrink-0 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-medium text-gray-600 dark:text-dark-muted hover:border-red-300 hover:text-red-500 transition">
                {t.rental.returnBtn}
              </button>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted">
              <FiPhone size={12} className="shrink-0 text-gray-400" />
              <span className="font-medium">{rental.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted">
              <FiCalendar size={12} className="shrink-0 text-gray-400" />
              <span>{t.rental.borrowedOn}: <strong>{rental.borrowedAt ? format(new Date(rental.borrowedAt.seconds * 1000), "dd MMM yyyy") : "—"}</strong></span>
            </div>
            <div className={"flex items-center gap-2 text-xs col-span-2 " +
              (isOverdue ? "text-red-500 font-semibold" : "text-gray-500 dark:text-dark-muted")}>
              <FiClock size={12} className="shrink-0" />
              <span>{t.rental.dueOn}: <strong>{rental.dueDate}</strong></span>
              {isOverdue && <span className="text-red-400">(!)</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <FiBookOpen className="text-primary-600" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.rental.myRentals}</h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted">{t.rental.myRentalsDesc}</p>
          </div>
        </div>

        {rentals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">{t.rental.noRentals}</h3>
            <p className="text-gray-500 dark:text-dark-muted mb-6">{t.rental.noRentalsDesc}</p>
            <Link to="/" className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition">
              {t.favorites.browseBooks}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active */}
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-muted mb-4">
                  {t.rental.active} ({active.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {active.map((r) => <RentalCard key={r.id} rental={r} />)}
                </div>
              </section>
            )}
            {/* Returned */}
            {returned.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-muted mb-4">
                  {t.rental.returned} ({returned.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {returned.map((r) => <RentalCard key={r.id} rental={r} />)}
                </div>
              </section>
            )}
          </div>
        )}
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
