import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBook } from "../../services/bookService";
import { getReviewsForBook, addReview, deleteReview } from "../../services/reviewService";
import { addFavorite, removeFavorite, isFavorite } from "../../services/favoriteService";
import { isBookBorrowed } from "../../services/rentalService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import Spinner from "../../components/ui/Spinner";
import StarRating from "../../components/ui/StarRating";
import RentModal from "../../components/ui/RentModal";
import { FiHeart, FiArrowLeft, FiStar, FiTrash2, FiBookOpen } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function BookDetails() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const { t } = useLang();
  const [book, setBook]             = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [fav, setFav]               = useState(false);
  const [borrowed, setBorrowed]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [comment, setComment]       = useState("");
  const [rating, setRating]         = useState(5);

  async function load() {
    setError(null);
    try {
      // Load book and reviews in parallel; book read is public per Rules
      const [b, revs] = await Promise.all([
        getBook(id),
        getReviewsForBook(id).catch(() => []),
      ]);
      setBook(b);
      setReviews(revs);
      if (currentUser) {
        const [favResult, borrowResult] = await Promise.all([
          isFavorite(currentUser.uid, id).catch(() => false),
          isBookBorrowed(currentUser.uid, id).catch(() => false),
        ]);
        setFav(favResult);
        setBorrowed(borrowResult);
      }
    } catch (err) {
      console.error("BookDetails load error:", err.code, err.message);
      setError(err.code || err.message || "unknown");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id, currentUser]);

  async function toggleFav() {
    if (!currentUser) { toast.error(t.bookDetails.loginToFav); return; }
    if (fav) {
      await removeFavorite(currentUser.uid, id);
      setFav(false);
      toast.success(t.bookDetails.removedFromFav);
    } else {
      await addFavorite(currentUser.uid, id);
      setFav(true);
      toast.success(t.bookDetails.addedToFav);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!currentUser) { toast.error(t.bookDetails.loginToReview); return; }
    if (!comment.trim()) return;
    setReviewLoading(true);
    try {
      await addReview({
        userId:   currentUser.uid,
        bookId:   id,
        username: userProfile?.name || currentUser.displayName || "Anonymous",
        comment,
        rating,
      });
      setReviews(await getReviewsForBook(id));
      setComment(""); setRating(5);
      toast.success(t.bookDetails.reviewAdded);
    } catch (err) {
      console.error("Review error:", err.code, err.message);
      // Show specific error message
      if (err.code === "permission-denied") {
        toast.error("Firestore Rules запрещают создание отзыва. Обнови Rules в Firebase Console.");
      } else {
        toast.error(t.bookDetails.reviewFailed + ": " + (err.message || err.code || "unknown"));
      }
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    await deleteReview(reviewId);
    setReviews(reviews.filter((r) => r.id !== reviewId));
    toast.success(t.bookDetails.reviewDeleted);
  }

  if (loading) return <Spinner fullScreen />;
  if (!book) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 gap-4">
      <div className="text-6xl">📚</div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{t.bookDetails.bookNotFound}</h2>
      {error && (
        <p className="text-sm text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
          {error === "permission-denied"
            ? "Firestore Rules: books collection read is not allowed. Check Rules in Firebase Console."
            : error}
        </p>
      )}
      <Link to="/" className="mt-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition text-sm">
        {t.bookDetails.backToBooks}
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline mb-6">
          <FiArrowLeft size={16} /> {t.bookDetails.backToBooks}
        </Link>

        {/* Main card */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Cover */}
            <div className="md:w-72 lg:w-80 shrink-0">
              {book.imageUrl
                ? <img src={book.imageUrl} alt={book.title} className="w-full h-80 md:h-full object-cover" />
                : <div className="w-full h-80 md:h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-8xl">📚</div>
              }
            </div>

            {/* Info */}
            <div className="flex-1 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {book.category && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-3 inline-block">
                      {book.category}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text leading-tight">{book.title}</h1>
                  <p className="text-gray-500 dark:text-dark-muted mt-1 text-lg">by {book.author}</p>
                </div>
                <button onClick={toggleFav} className="shrink-0 p-3 rounded-full border border-gray-200 dark:border-dark-border hover:border-red-300 transition">
                  {fav ? <FaHeart className="text-red-500" size={22} /> : <FiHeart className="text-gray-400" size={22} />}
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <StarRating rating={book.rating || 0} size={18} showValue />
                <span className="text-sm text-gray-400">({reviews.length} {t.bookDetails.reviews})</span>
              </div>

              <div className="mt-4 text-3xl font-bold text-primary-600 dark:text-primary-400">
                {Number(book.price || 0).toFixed(0)} сом
              </div>

              {book.description && (
                <p className="mt-5 text-gray-600 dark:text-dark-muted leading-relaxed text-sm">{book.description}</p>
              )}

              {book.createdAt && (
                <p className="mt-4 text-xs text-gray-400">
                  {t.bookDetails.addedOn} {format(new Date(book.createdAt.seconds * 1000), "MMMM d, yyyy")}
                </p>
              )}

              {/* ── Borrow button ── */}
              <div className="mt-6">
                {borrowed ? (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold text-sm">
                    <FiBookOpen size={16} /> {t.bookDetails.alreadyBorrowed}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentUser) { toast.error(t.bookDetails.loginToBorrow); return; }
                      setShowRentModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-sm text-sm">
                    <FiBookOpen size={16} /> {t.bookDetails.borrowBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-6">
            {t.bookDetails.reviews} ({reviews.length})
          </h2>

          {currentUser && (
            <form onSubmit={submitReview} className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-4">{t.bookDetails.writeReview}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 dark:text-dark-muted">{t.bookDetails.yourRating}</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)}>
                      <FiStar size={22}
                        className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        style={{ fill: s <= rating ? "currentColor" : "none" }} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder={t.bookDetails.reviewPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
              <button type="submit" disabled={reviewLoading}
                className="mt-3 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition disabled:opacity-60">
                {reviewLoading ? t.bookDetails.submitting : t.bookDetails.submitReview}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">{t.bookDetails.noReviews}</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center font-semibold text-primary-600 dark:text-primary-300 text-sm">
                        {(r.username || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-dark-text text-sm">{r.username}</p>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {r.createdAt ? format(new Date(r.createdAt.seconds * 1000), "MMM d, yyyy") : ""}
                      </span>
                      {(currentUser?.uid === r.userId || userProfile?.role === "admin") && (
                        <button onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-dark-muted leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rent Modal */}
      <RentModal
        isOpen={showRentModal}
        onClose={() => setShowRentModal(false)}
        book={book}
        onSuccess={() => setBorrowed(true)}
      />
    </div>
  );
}
