import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, updateBook } from "../../services/bookService";
import { useLang } from "../../i18n/index.jsx";
import BookForm from "../../components/admin/BookForm";
import Spinner from "../../components/ui/Spinner";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminEditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getBook(id).then(setBook).catch(() => toast.error(t.bookDetails.bookNotFound)).finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await updateBook(id, data);
      toast.success(t.bookForm.updateSuccess);
      navigate("/admin/books");
    } catch {
      toast.error(t.bookForm.updateFailed);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <Spinner />;
  if (!book) return <div className="text-center py-20 text-gray-500">{t.bookDetails.bookNotFound}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg transition">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.bookForm.editTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5 max-w-md truncate">{book.title}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm p-6 md:p-8">
        <BookForm defaultValues={book} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}