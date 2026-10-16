import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBook } from "../../services/bookService";
import { getReviewsForBook, addReview, deleteReview } from "../../services/reviewService";
import { addFavorite, removeFavorite, isFavorite } from "../../services/favoriteService";
import { isBookBorrowed } from "../../services/rentalService";
import { addToReadingList, getReadingEntry } from "../../services/readingService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import Spinner from "../../components/ui/Spinner";
import StarRating from "../../components/ui/StarRating";
import RentModal from "../../components/ui/RentModal";
import { FiHeart, FiArrowLeft, FiStar, FiTrash2, FiBookOpen, FiBookmark, FiMessageCircle } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { localizeBook } from "../../utils/localizeBook";

export default function BookDetails() {
  const { id } = useParams();
  const { currentUser, userProfile } = useAuth();
  const { lang, t } = useLang();

  const [book,          setBook]          = useState(null);
  const [reviews,       setReviews]       = useState([]);
  const [fav,           setFav]           = useState(false);
  const [borrowed,      setBorrowed]      = useState(false);
  const [readingEntry,  setReadingEntry]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [comment,       setComment]       = useState("");
  const [rating,        setRating]        = useState(5);

  async function load() {
    setError(null);
    try {
      const [b, revs] = await Promise.all([
        getBook(id),
        getReviewsForBook(id).catch(() => []),
      ]);
      setBook(b);
      setReviews(revs);
      if (currentUser) {
        const [favR, borrowR, re] = await Promise.all([
          isFavorite(currentUser.uid, id).catch(() => false),
          isBookBorrowed(currentUser.uid, id).catch(() => false),
          getReadingEntry(currentUser.uid, id).catch(() => null),
        ]);
        setFav(favR);
        setBorrowed(borrowR);
        setReadingEntry(re);
      }
    } catch (err) {
      console.error("BookDetails error:", err.code, err.message);
      setError(err.code === "permission-denied" ? "permission-denied" : err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id, currentUser]);

  async function toggleFav() {
    if (!currentUser) { toast.error(t.bookDetails.loginToFav); return; }
    if (fav) {
      await removeFavorite(currentUser.uid, id).catch(() => {});
      setFav(false);
      toast.success(t.bookDetails.removedFromFav);
    } else {
      await addFavorite(currentUser.uid, id).catch(() => {});
      setFav(true);
      toast.success(t.bookDetails.addedToFav);
    }
  }

  async function handleAddToReadingList() {
    if (!currentUser) { toast.error(t.bookDetails.loginToBorrow); return; }
    try {
      await addToReadingList({
        userId: currentUser.uid,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author || "",
        translations: book.translations || {},
        imageUrl: book.imageUrl || "",
        status: "want",
        totalPages: 0,
      });
      const re = await getReadingEntry(currentUser.uid, book.id);
      setReadingEntry(re);
      toast.success(t.bookDetails.readingListAdded);
    } catch (err) {
      console.error("Reading list error:", err.code, err.message);
      toast.error(
        err.code === "permission-denied"
          ? t.bookDetails.readingListPermissionError
          : err.message
      );
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
        username: userProfile?.name || currentUser.displayName || t.bookDetails.anonymous,
        comment,
        rating,
      });
      setReviews(await getReviewsForBook(id).catch(() => []));
      setComment(""); setRating(5);
      toast.success(t.bookDetails.reviewAdded);
    } catch (err) {
      console.error("Review error:", err.code, err.message);
      if (err.code === "permission-denied") {
        toast.error(t.bookDetails.firestorePermissionError);
      } else if (err.code === "failed-precondition") {
        toast.error(t.bookDetails.indexBuildingError);
      } else {
        toast.error(t.bookDetails.reviewFailed + ": " + err.message);
      }
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    await deleteReview(reviewId).catch(() => {});
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    toast.success(t.bookDetails.reviewDeleted);
  }

  if (loading) return <Spinner fullScreen />;

  if (error || !book) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-4">
      <FiBookOpen className="text-primary-500" size={64} aria-hidden="true" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">{t.bookDetails.bookNotFound}</h2>
      {error === "permission-denied" && (
        <p className="text-sm text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl max-w-md">
          {t.bookDetails.bookReadPermissionError}
        </p>
      )}
      <Link to="/" className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition text-sm">
        ← {t.bookDetails.backToBooks}
      </Link>
    </div>
  );

  const localizedBook = localizeBook(book, lang, t);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline mb-6">
          <FiArrowLeft size={15}/> {t.bookDetails.backToBooks}
        </Link>

        {/* Book card */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row">
            {/* Cover */}
            <div className="sm:w-56 shrink-0">
              {book.imageUrl
                ? <img src={book.imageUrl} alt={localizedBook.title} className="w-full h-72 sm:h-full object-cover"/>
                : <div className="w-full h-72 sm:h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center"><FiBookOpen className="text-primary-500" size={72} aria-hidden="true" /></div>
              }
            </div>
            {/* Info */}
            <div className="flex-1 p-6">
              {localizedBook.category && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 mb-3 inline-block">
                  {localizedBook.category}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text leading-tight">{localizedBook.title}</h1>
              <p className="text-gray-500 dark:text-dark-muted mt-1">{t.bookDetails.by} {localizedBook.author}</p>

              <div className="flex items-center gap-3 mt-3">
                <StarRating rating={book.rating || 0} size={16} showValue/>
                <span className="text-sm text-gray-400">({reviews.length} {t.bookDetails.reviews})</span>
              </div>

              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-3">
                {Number(book.price || 0).toFixed(0)} сом
              </p>

              {localizedBook.description && (
                <p className="mt-4 text-gray-600 dark:text-dark-muted text-sm leading-relaxed">{localizedBook.description}</p>
              )}

              {book.createdAt && (
                <p className="text-xs text-gray-400 mt-3">
                  {t.bookDetails.addedOn} {new Intl.DateTimeFormat(
                    lang === "ky" ? "ky-KG" : lang === "ru" ? "ru-RU" : "en-GB",
                    { day: "numeric", month: "short", year: "numeric" }
                  ).format(new Date(book.createdAt.seconds * 1000))}
                </p>
              )}

              {/* ── Action buttons row ── */}
              <div className="flex flex-wrap gap-3 mt-5">
                {/* Favourite */}
                <button onClick={toggleFav}
                  className={"flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition " +
                    (fav ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500" : "border-gray-200 dark:border-dark-border text-gray-500 hover:border-red-300")}
                >
                  {fav ? <FaHeart aria-hidden="true" /> : <FiHeart aria-hidden="true" />} {fav ? t.bookDetails.inFavorites : t.bookDetails.addToFavorites}
                </button>

                {/* Borrow */}
                {borrowed ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold text-sm">
                    <FiBookOpen size={15}/> {t.bookDetails.alreadyBorrowed}
                  </div>
                ) : (
                  <button onClick={() => { if (!currentUser) { toast.error(t.bookDetails.loginToBorrow); return; } setShowRentModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition shadow-sm">
                    <FiBookOpen size={15}/> {t.bookDetails.borrowBtn}
                  </button>
                )}

                {/* Reading list */}
                {currentUser && (
                  readingEntry ? (
                    <Link to="/reading"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm hover:bg-purple-200 transition">
                      <FiBookOpen aria-hidden="true" /> {t.bookDetails.readingListLink}
                    </Link>
                  ) : (
                    <button onClick={handleAddToReadingList}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-semibold text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                      <FiBookmark aria-hidden="true" /> {t.bookDetails.wantToRead}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews section ── */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-5">
            {t.bookDetails.reviews} ({reviews.length})
          </h2>

          {/* Write review */}
          {currentUser ? (
            <form onSubmit={submitReview} className="mb-6 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
              <h3 className="font-semibold text-gray-800 dark:text-dark-text text-sm mb-3">{t.bookDetails.writeReview}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500 dark:text-dark-muted">{t.bookDetails.yourRating}</span>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)} className="focus:outline-none">
                    <FiStar size={22}
                      className={s <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                      style={{ fill: s <= rating ? "currentColor" : "none" }}/>
                  </button>
                ))}
              </div>
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder={t.bookDetails.reviewPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              />
              <button type="submit" disabled={reviewLoading}
                className="mt-2.5 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {reviewLoading ? t.bookDetails.submitting : t.bookDetails.submitReview}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <p className="text-sm text-blue-600 dark:text-blue-300">
                <Link to="/login" className="font-semibold hover:underline">{t.bookDetails.loginLink}</Link> {t.bookDetails.loginPrompt}
              </p>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FiMessageCircle className="mx-auto mb-2 text-gray-300" size={40} aria-hidden="true" />
              <p className="text-sm">{t.bookDetails.noReviews}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-gray-100 dark:border-dark-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center font-bold text-primary-600 dark:text-primary-300 text-sm shrink-0">
                        {(r.username || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-dark-text text-sm">{r.username}</p>
                        <StarRating rating={r.rating} size={12}/>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">
                        {r.createdAt ? format(new Date(r.createdAt.seconds * 1000), "d MMM yyyy") : ""}
                      </span>
                      {(currentUser?.uid === r.userId || userProfile?.role === "admin") && (
                        <button onClick={() => handleDeleteReview(r.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                          <FiTrash2 size={13}/>
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

      <RentModal isOpen={showRentModal} onClose={() => setShowRentModal(false)} book={book} onSuccess={() => setBorrowed(true)}/>
    </div>
  );
}